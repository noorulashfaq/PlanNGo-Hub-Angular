import { Component, OnInit } from '@angular/core';
import { TourPackagesService } from '../../services/tour-packages.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent implements OnInit {
  isFabMenuOpen = false;
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading = false;
  errorMessage: string = '';
  userId: string = "";
  expandedBookingId: string | null = null; // For toggling detailed view
  statusOption = true;
  searchQuery = '';
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc'; // Default to ascending
  filterStatus: string | null = '';

  constructor(
    private tourPackagesService: TourPackagesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userId = sessionStorage.getItem("userId") || "";
    this.fetchBookings();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Fetch bookings from the service
  async fetchBookings() {
    this.loading = true;
    await this.sleep(2000);
    this.tourPackagesService.getUserBookings(this.userId).subscribe(
      (data: any[]) => {
        this.bookings = data;
        this.filteredBookings = [...this.bookings]; // Initialize filtered bookings
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching bookings:', error);
        this.errorMessage = 'Failed to load bookings, please try again later.';
        this.loading = false;
      }
    );
  }

  // Method to apply filters, sorting, and search
  applyFilters() {
    let filtered = [...this.bookings];

    // Filter by status
    if (this.filterStatus) {
      this.statusOption = this.filterStatus === 'Cancelled' ? false : true;
      filtered = filtered.filter((booking) => booking.status === this.statusOption);
    }

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((booking) =>
        Object.values(booking).some((val) =>
          val ? val.toString().toLowerCase().includes(query) : false
        )
      );
    }

    // Sorting
    // if (this.sortField) {
    //   filtered.sort((a, b) => {
    //     const valA = a[this.sortField!];
    //     const valB = b[this.sortField!];
    //     if (this.sortDirection === 'asc') {
    //       return valA > valB ? 1 : valA < valB ? -1 : 0;
    //     } else {
    //       return valA < valB ? 1 : valA > valB ? -1 : 0;
    //     }
    //   });
    // }

    this.filteredBookings = filtered;
  }

  // Method to handle sorting logic
  applySorting() {
    this.applyFilters();
  }

  // Reset filters and search query
  resetFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.sortField = null;
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  // Navigate to edit booking page
  // editBooking(bookingId: string) {
  //   this.router.navigate([`/tours/package/${bookingId}/reserve`]);
  // }

  // Delete booking
  // deleteBooking(bookingId: string) {
  //   if (confirm('Are you sure you want to delete this booking?')) {
  //     this.loading = true;
  //     this.tourPackagesService.deleteBooking(bookingId).subscribe(
  //       () => {
  //         console.log(`Booking with ID: ${bookingId} deleted successfully.`);
  //         this.bookings = this.bookings.filter((b) => b.bookingId !== bookingId);
  //         this.filteredBookings = [...this.bookings];
  //         this.loading = false;
  //         alert('Booking deleted successfully.');
  //       },
  //       (error) => {
  //         console.error('Error deleting booking:', error);
  //         alert('Failed to delete booking. Please try again later.');
  //         this.loading = false;
  //       }
  //     );
  //   }
  // }

  updateBookingStatus(bookingId: string) {
    if (confirm('Are you sure you want to update the status of this booking?')) {
      this.loading = true;
  
      // Get the booking details by ID
      this.tourPackagesService.getBookingById(bookingId).subscribe(
        (booking) => {
          // Update the booking status
          booking.status = false;
          console.log(booking);
  
          // Call service to update the booking status
          this.tourPackagesService.updateBookingStatus(bookingId, booking).subscribe(
            () => {
              console.log(`Booking with ID: ${bookingId} status updated to false.`);
  
              // Update the local bookings list to reflect the new status
              this.bookings = this.bookings.map((b) =>
                b.bookingId === bookingId ? { ...b, status: false } : b
              );
              this.filteredBookings = [...this.bookings];
  
              this.loading = false;
              window.location.reload();
              // alert('Booking status updated successfully.');
            },
            (error) => {
              console.error('Error updating booking status:', error);
              // alert('Failed to update booking status. Please try again later.');
              this.loading = false;
            }
          );
        },
        (error) => {
          console.error('Error fetching booking:', error);
          alert('Failed to fetch booking details. Please try again later.');
          this.loading = false;
        }
      );
    }
  }  

  // Toggle showing details for a booking
  toggleDetails(bookingId: string) {
    this.expandedBookingId = this.expandedBookingId === bookingId ? null : bookingId;
  }

  // Toggle FAB menu
  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  // Toggle sort direction
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters(); // Reapply filters and sorting when the direction changes
  }
}