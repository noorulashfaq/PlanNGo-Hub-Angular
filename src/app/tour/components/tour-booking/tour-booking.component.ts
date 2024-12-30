import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TourPackagesService } from "../../services/tour-packages.service";
import { TourPackage } from "../../models/tour-package-entities"; // Ensure correct model import
<<<<<<< HEAD
import { ReactiveFormsModule } from "@angular/forms"; // Add this import
import { HttpErrorResponse } from "@angular/common/http"; // Import for error handling
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
=======
import { ReactiveFormsModule } from '@angular/forms'; // Add this import
import { HttpErrorResponse } from "@angular/common/http"; // Import for error handling
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from "@angular/router";
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)

@Component({
  selector: "app-tour-booking",
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, RouterModule], // Ensure ReactiveFormsModule is imported here
=======
  imports: [CommonModule,HttpClientModule, ReactiveFormsModule, RouterModule], // Ensure ReactiveFormsModule is imported here
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
  providers: [TourPackagesService],
  templateUrl: "./tour-booking.component.html",
  styleUrls: ["./tour-booking.component.css"],
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  packages: TourPackage[] = [];
  selectedPackage: TourPackage | undefined;
  guestsAndRoomsSummary = "Select Guests and Rooms";
  dropdownVisible = false;
  totalPrice: number = 0;
<<<<<<< HEAD

  constructor(
    private fb: FormBuilder,
    private tourPackagesService: TourPackagesService,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private router: Router // Inject Router
=======
  onPrevious: any;

  constructor(
    private fb: FormBuilder,
    private tourPackagesService: TourPackagesService
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
  ) {
    this.bookingForm = this.fb.group({
      packageType: ["", Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.min(0)]],
      rooms: [1, [Validators.required, Validators.min(1)]],
      arrivalDate: ["", Validators.required],
      departureDate: ["", Validators.required],
      freePickup: ["no", Validators.required],
      amount: [{ value: "", disabled: true }, Validators.required],
      specialRequest: [""],
    });
  }

  ngOnInit() {
    this.tourPackagesService.getTourPackages().subscribe(
      (data) => {
        this.packages = data; // Fetch available packages
      },
<<<<<<< HEAD
      (error: HttpErrorResponse) => {
=======
      (error: HttpErrorResponse) => { // Explicitly type the 'error' parameter
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
        console.error("Error fetching tour packages:", error);
        alert("An error occurred while fetching packages. Please try again.");
      }
    );
  }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  done() {
    const adults = this.bookingForm.get("adults")?.value;
    const children = this.bookingForm.get("children")?.value;
    const rooms = this.bookingForm.get("rooms")?.value;

    this.guestsAndRoomsSummary = `${adults} Adults, ${children} Children, ${rooms} Rooms`;
    this.dropdownVisible = false;
    this.calculatePrice(); // Recalculate price when selection changes
  }

  calculatePrice() {
    const arrivalDate = new Date(this.bookingForm.get("arrivalDate")?.value);
    const departureDate = new Date(this.bookingForm.get("departureDate")?.value);
<<<<<<< HEAD
    const numOfDays =
      (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 3600 * 24);
=======
    const numOfDays = (departureDate.getTime() - arrivalDate.getTime()) / (1000 * 3600 * 24);
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)

    if (this.selectedPackage && numOfDays > 0) {
      const adults = this.bookingForm.get("adults")?.value;
      const children = this.bookingForm.get("children")?.value;
      const basePrice = this.selectedPackage.Price;

<<<<<<< HEAD
      this.totalPrice =
        basePrice * numOfDays * (adults + children * 0.5); // Calculate total price
      this.bookingForm
        .get("amount")
        ?.setValue(`INR ${this.totalPrice.toFixed(2)}`);
=======
      this.totalPrice = basePrice * numOfDays * (adults + children * 0.5); // Calculate total price
      this.bookingForm.get("amount")?.setValue(`INR ${this.totalPrice.toFixed(2)}`);
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
    }
  }

  onPackageTypeChange() {
    const selectedPackage = this.bookingForm.get("packageType")?.value;
    this.selectedPackage = this.packages.find(
      (pkg) => pkg.Name === selectedPackage
    );
    this.calculatePrice(); // Recalculate price on package change
  }

<<<<<<< HEAD
  onPrevious() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.router.navigate([`tour/${id}`]);
    } else {
      console.error("ID not found in the route.");
      alert("Cannot navigate to the previous page because the ID is missing.");
    }
  }
=======
  // onPrevious() {
  //   // Logic for the "Previous" button (can be used to navigate to a previous page or reset form, if needed)
  //   console.log("Navigating to the previous page...");
  //   // Add the actual navigation or reset logic here, if required
  // }
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)

  onSubmit() {
    if (this.bookingForm.valid) {
      const formData = {
        ...this.bookingForm.value,
        tourId: this.selectedPackage?.TourId,
        totalPrice: this.totalPrice,
      };
<<<<<<< HEAD
      this.tourPackagesService.createBooking(formData).subscribe(
=======
      this.tourPackagesService.bookTour(formData).subscribe(
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
        (response: any) => {
          console.log("Booking Successful:", response);
          alert("Your booking has been confirmed!");
        },
<<<<<<< HEAD
        (error: HttpErrorResponse) => {
=======
        (error: HttpErrorResponse) => { // Explicitly type the 'error' parameter for error handling
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
          console.error("Booking Error:", error);
          alert("Something went wrong. Please try again.");
        }
      );
    }
  }
}

<<<<<<< HEAD

=======
>>>>>>> b4422fc7 (Initial commit or your descriptive commit message)
