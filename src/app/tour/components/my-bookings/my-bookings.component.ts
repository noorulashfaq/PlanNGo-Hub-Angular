import { Component, OnInit } from '@angular/core';
import { TourPackagesService } from '../../services/tour-packages.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-booking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent implements OnInit {
isFabMenuOpen: any;
 
  bookings: any[] = [];
  loading = false;
  errorMessage: string = '';
  userId: string = ''; // Replace this with actual userId fetching logic
  expandedBookingId: string | null = null; // For toggling detailed view
  dropdownVisible: boolean | undefined;

  constructor(
    private tourPackagesService: TourPackagesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchBookings();
  }

  // Fetch bookings from the service
  fetchBookings() {
    this.loading = true;
    this.tourPackagesService.getUserBookings(this.userId).subscribe(
      (data: any[]) => {
        this.bookings = data;
        console.log('Fetched bookings:', this.bookings);
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching bookings:', error);
        this.errorMessage = 'Failed to load bookings, please try again later.';
        this.loading = false;
      }
    );
  }

  // Navigate to edit booking page
  editBooking(bookedId: string) {
    console.log(`Editing booking with ID: ${bookedId}`);
    this.router.navigate([`tours/package/:id/reservetours/package/:id/reserve`]);
  }
  
  // delet booking 
  deleteBooking(bookedId: string) {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.loading = true; // Start loading indicator
      this.tourPackagesService.deleteBooking(bookedId).subscribe(
        () => {
          console.log(`Booking with ID: ${bookedId} deleted successfully.`);
          this.bookings = this.bookings.filter((b) => b.id !== bookedId); // Remove booking from the list
          this.loading = false; // Stop loading
          alert('Booking deleted successfully.');
        },
        (error) => {
          this.loading = false; // Stop loading
          console.error('Error deleting booking', error);
          alert('Failed to delete booking. Please try again later.');
        }
      );
    }
  }
  
  

  // Toggle showing details for a booking
  toggleDetails(bookedId: string) {
    this.expandedBookingId =
      this.expandedBookingId === bookedId ? null : bookedId;
  }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }
}