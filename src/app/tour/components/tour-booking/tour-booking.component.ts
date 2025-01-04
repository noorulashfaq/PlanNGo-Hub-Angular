import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from "@angular/forms";
import { TourPackagesService } from "../../services/tour-packages.service";
import { ReactiveFormsModule } from "@angular/forms"; // Add this import
import { HttpErrorResponse } from "@angular/common/http"; // Import for error handling
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-tour-booking",
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
  ],
  providers: [TourPackagesService],
  templateUrl: "./tour-booking.component.html",
  styleUrls: ["./tour-booking.component.css"],
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  packages: any;
  // selectedPackage: TourPackage | undefined;
  guestsAndRoomsSummary = "Select Guests and Rooms";
  dropdownVisible = false;
  totalPrice: number = 0;
  isFabMenuOpen = false;
  showPaymentModal: boolean = false;
  bookedId: string = "";

  paymentData = {
    nameOnCard: "",
    cardNumber: "",
    expDate: "",
    cvv: "",
  };

  bookingData = {
    paymentStatus: false, // initially empty
    paymentId: "", // initially empty
  };

  constructor(
    private fb: FormBuilder,
    private tourPackagesService: TourPackagesService,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private router: Router // Inject Router
  ) {
    this.bookingForm = this.fb.group(
      {
        userId: ["", Validators.required],
        tourId: ["", Validators.required],
        adults: [1, [Validators.required, Validators.min(1)]],
        children: [0, [Validators.min(0)]],
        rooms: [1, [Validators.required, Validators.min(1)]],
        arrivalDate: ["", Validators.required],
        departureDate: ["", Validators.required],
        freePickup: ["no", Validators.required],
        paymentStatus: false,
        paymentId: [""],
        amount: [{ value: "", disabled: true }, Validators.required],
        specialRequest: [""],
      },
      { validator: this.dateRangeValidator }
    );
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const arrival = group.get("arrivalDate")?.value;
    const departure = group.get("departureDate")?.value;
    return arrival && departure && arrival < departure
      ? null
      : { invalidDateRange: true };
  }

  ngOnInit() {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      this.bookingForm.patchValue({
        userId: userId,
      });
    } else {
      alert("Please log in to continue.");
      this.router.navigate(["/login"]);
      return; // Stop further execution if user is not logged in
    }
    const tourId = this.route.snapshot.paramMap.get("id");
    if (tourId) {
      this.bookingForm.patchValue({
        tourId: tourId,
      });
      this.tourPackagesService.getTourPackages().subscribe(
        (data) => {
          this.packages = data.find((pkg) => pkg.TourId === tourId);
          if (!this.packages) {
            alert("Tour package not found.");
          }
        },
        (error: HttpErrorResponse) => {
          console.error("Error fetching tour packages:", error);
          alert(
            "An error occurred while fetching the tour package. Please try again."
          );
        }
      );
    } else {
      alert("Invalid tour ID.");
      this.router.navigate(["/"]);
    }
  }

  onSubmitPayment(): void {
    if (this.isValid()) {
      this.addNewPayment();
      this.closePaymentModal();
      this.router.navigate([`/tour/${this.route.snapshot.paramMap.get("id")}`]);
    } else {
      console.error("Form is invalid");
    }
  }

  addNewPayment(): void {
    this.tourPackagesService.addNewPayment(this.paymentData).subscribe(
      (response) => {
        console.log("Payment successful", response);
        this.updateBooking(response.id);
        // Handle success, e.g., navigate to success page or show a success message
      },
      (error) => {
        console.error("Payment failed", error);
        // Handle error, e.g., show an error message
      }
    );
  }

  // Update booking with the payment status and payment ID
  updateBooking(paymentId: string): void {
    this.bookingForm.patchValue({
      paymentStatus: true,
      paymentId: paymentId,
    });

    // Call the service to update the booking
    this.tourPackagesService
      .updateBooking(this.bookedId, this.bookingForm.value)
      .subscribe(
        (updateResponse) => {
          console.log("Booking updated successfully", updateResponse);
          // Handle success (e.g., navigate to a confirmation page)
        },
        (updateError) => {
          console.error("Failed to update booking", updateError);
          // Handle error (e.g., show an error message)
        }
      );
  }

  isValid(): boolean {
    return (
      String(this.paymentData.nameOnCard).trim() !== "" &&
      String(this.paymentData.cardNumber).trim() !== "" &&
      String(this.paymentData.expDate).trim() !== "" &&
      String(this.paymentData.cvv).trim() !== ""
    );
  }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  done() {
    const { adults, children, rooms } = this.bookingForm.value;

    this.guestsAndRoomsSummary = `${adults} Adults, ${children} Children, ${rooms} Rooms`;
    this.dropdownVisible = false;
    this.calculatePrice();
  }

  calculatePrice() {
    const arrivalDate = this.bookingForm.get("arrivalDate")?.value;
    const departureDate = this.bookingForm.get("departureDate")?.value;

    if (!arrivalDate || !departureDate) return;

    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const numOfDays =
      (departure.getTime() - arrival.getTime()) / (1000 * 3600 * 24);

    if (this.packages && numOfDays > 0) {
      const adults = this.bookingForm.get("adults")?.value || 0;
      const children = this.bookingForm.get("children")?.value || 0;
      const basePrice = this.packages.Price;

      this.totalPrice = basePrice * numOfDays * (adults + children * 0.5);
      this.bookingForm
        .get("amount")
        ?.setValue(`INR ${this.totalPrice.toFixed(2)}`);
    } else {
      this.bookingForm.get("amount")?.setValue("");
    }
  }

  onPrevious() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.router.navigate([`tour/${id}`]);
    } else {
      console.error("ID not found in the route.");
      alert("Cannot navigate to the previous page because the ID is missing.");
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const formData = {
        ...this.bookingForm.value,
        tourId: this.route.snapshot.paramMap.get("id"),
        totalPrice: this.totalPrice,
      };
      this.tourPackagesService.createBooking(formData).subscribe(
        (response: any) => {
          console.log("Booking Successful:", response);
          this.bookedId = response.id;
          this.openPaymentModal();
          // alert("Your booking has been confirmed!");
        },
        (error: HttpErrorResponse) => {
          console.error("Booking Error:", error);
          // alert("Something went wrong. Please try again.");
        }
      );
    }
  }
}
