import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from "@angular/forms";
import { TourPackagesService } from "../../services/tour-packages.service";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { TourBooking } from "../../models/tour-booking-entities"; // Import the TourBooking model
import { AbstractControl, ValidationErrors } from "@angular/forms";
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
  paymentForm: FormGroup;
  packages: any;
  guestsAndRoomsSummary = "Select Guests and Rooms";
  dropdownVisible = false;
  totalPrice: number = 0;
  isFabMenuOpen = false;
  showPaymentModal: boolean = false;
  bookedId: string = "";
  isLoading = false;
  showSuccessPopup = false;
  successHeader = "";
  successMessage = "";
  loadingTimeout: any;
  isFormSuccess: boolean = false;
  isFormSubmitting: boolean = false;

  paymentData = {
    nameOnCard: "",
    cardNumber: "",
    expDate: "",
    cvv: "",
  };

  bookingData: Partial<TourBooking> = {
    paymentStatus: false,
    paymentId: "",
    createdAt: new Date(), // Added createdDate to booking data
  };
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const arrivalDate = control.get("arrivalDate")?.value;
    const departureDate = control.get("departureDate")?.value;

    if (
      arrivalDate &&
      departureDate &&
      new Date(arrivalDate) < new Date(departureDate)
    ) {
      return { invalidDateRange: true };
    }
    return null;
  }
  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }
  onPrevious() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.router.navigate([`tours/package/${id}`]);
    } else {
      console.error("ID not found in the route.");
      alert("Cannot navigate to the previous page because the ID is missing.");
    }
  }
  done() {
    const { adults, children, rooms } = this.bookingForm.value;

    this.guestsAndRoomsSummary = `${adults} Adults, ${children} Children, ${rooms} Rooms`;
    this.dropdownVisible = false;
    this.calculatePrice();
  }
  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }
  // Show Loading
  async showLoading(duration: number = 2000): Promise<void> {
    console.log("Showing loading...");
    this.isLoading = true;
  } // Set loading state to true to show spinner
  constructor(
    private fb: FormBuilder,
    private tourPackagesService: TourPackagesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bookingForm = this.fb.group(
      {
        userId: ["", Validators.required],
        tourId: ["", Validators.required],
        tourName: ["", Validators.required],
        adults: [1, [Validators.required, Validators.min(1)]],
        children: [0, [Validators.min(0)]],
        rooms: [1, [Validators.required, Validators.min(1)]],
        departureDate: ["", Validators.required],
        arrivalDate: ["", Validators.required],
        freePickup: ["no", Validators.required],
        paymentStatus: false,
        paymentId: [""],
        amount: ["", Validators.required],
        specialRequest: [""],
        bookingDate: ["", Validators.required],
        status: true,
      },
      { validator: this.dateRangeValidator }
    );

    this.paymentForm = this.fb.group({
      nameOnCard: [
        "",
        [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)],
      ],
      cardNumber: [
        "",
        [Validators.required, Validators.pattern(/^\d{13,19}$/)],
      ],
      expDate: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
          this.expirationDateValidator,
        ],
      ],
      cvv: ["", [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  hideLoading(): void {
    this.isLoading = false;
  }
  async closeSuccessPopup(): Promise<void> {
    await this.sleep(1000);
    this.showSuccessPopup = false;
    this.router.navigate([
      `/tours/package/${this.route.snapshot.paramMap.get("id")}`,
    ]);
  }
  showSuccess(header: string, message: string): void {
    this.successHeader = header;
    this.successMessage = message;
    this.showSuccessPopup = true;
  }
  expirationDateValidator(control: any) {
    const currentDate = new Date();
    const [month, year] = control.value
      .split("/")
      .map((x: string) => parseInt(x, 10));
    const yearNumber = parseInt(`20${year}`, 10);
    const expDate = new Date(yearNumber, month - 1);
    return expDate > currentDate ? null : { invalidDate: true };
  }

  ngOnInit() {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      this.bookingForm.patchValue({ userId });
    } else {
      alert("Please log in to continue.");
      this.router.navigate(["/login"]);
      return;
    }

    const tourId = this.route.snapshot.paramMap.get("id");
    if (tourId) {
      this.bookingForm.patchValue({ tourId });
      this.tourPackagesService.getTourPackages().subscribe(
        (data) => {
          this.packages = data.find((pkg) => pkg.TourId === tourId);
          this.bookingForm.patchValue({
            tourName: this.packages.Name,
            bookingDate: new Date()
          })
          if (!this.packages) alert("Tour package not found.");
        },
        (error: HttpErrorResponse) => {
          console.error("Error fetching tour packages:", error);
          alert("Error fetching the tour package. Please try again.");
        }
      );
    } else {
      alert("Invalid tour ID.");
      this.router.navigate(["/"]);
    }
  }

  calculatePrice() {
    const arrivalDate = this.bookingForm.get("arrivalDate")?.value;
    const departureDate = this.bookingForm.get("departureDate")?.value;

    if (!arrivalDate || !departureDate) return;

    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const numOfDays =
      (arrival.getTime() - departure.getTime()) / (1000 * 3600 * 24);

    if (this.packages && numOfDays > 0) {
      const adults = this.bookingForm.get("adults")?.value || 0;
      const children = this.bookingForm.get("children")?.value || 0;
      const basePrice = Number(this.packages.Price) || 0; // Ensure price is a number

      this.totalPrice = basePrice * numOfDays * (adults + children * 0.5);
      this.bookingForm
        .get("amount")
        ?.setValue(`INR ${this.totalPrice.toFixed(2)}`);
    } else {
      this.bookingForm.get("amount")?.setValue("");
    }
  }

  async onSubmitPayment(): Promise<void> {
    this.showLoading(); // Show loading spinner
    await this.sleep(2000);
    if (this.isValid()) {
      this.addNewPayment();
      this.closePaymentModal();
    } else {
      console.error("Form is invalid");
      this.isLoading = false;
    }
  }

  addNewPayment(): void {
    this.tourPackagesService.addNewPayment(this.paymentForm.value).subscribe(
      (response) => {
        console.log("Payment successful", response);
        this.updateBooking(response.id);
        this.hideLoading();
        this.showSuccess("Success", "Payment completed successfully!");
      },
      (error) => {
        console.error("Payment failed", error);
        this.hideLoading();
        this.showSuccess("Failed", "Payment failed! " + error.statusText);
      }
    );
  }
  setArrivalDateLimit(): void {
    const departureDateInput = document.getElementById(
      "departureDate"
    ) as HTMLInputElement;
    const arrivalDateInput = document.getElementById(
      "arrivalDateTime"
    ) as HTMLInputElement;

    if (departureDateInput && arrivalDateInput) {
      const departureDate = departureDateInput.value;

      // Validate if departureDate is set
      if (departureDate) {
        arrivalDateInput.min = departureDate; // Set 'min' for arrivalDateInput based on departureDate
      }
    }

    this.calculatePrice();
  }
  updateBooking(paymentId: string): void {
    this.bookingForm.patchValue({ paymentStatus: true, paymentId });
    this.tourPackagesService
      .updateBooking(this.bookedId, this.bookingForm.value)
      .subscribe(
        (updateResponse) =>
          console.log("Booking updated successfully", updateResponse),
        (updateError) => console.error("Failed to update booking", updateError)
      );
  }

  isValid(): boolean {
    return Object.values(this.paymentForm.value).every(
      (val) => String(val).trim() !== ""
    );
  }

  async onSubmit() {
    if (this.bookingForm.valid) {
      this.showLoading();
      await this.sleep(2000);
      this.tourPackagesService.createBooking(this.bookingForm.value).subscribe(
        (response: any) => {
          console.log("Booking Successful:", response);
          this.bookedId = response.id;
          this.openPaymentModal();
          this.hideLoading();
        },
        (error: HttpErrorResponse) => {
          console.error("Booking Error:", error);
          this.hideLoading();
        }
      );
    }
  }
}