import { Component, OnInit, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TourPackagesService } from '../../services/tour-packages.service';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-agency-admin-dashboard',
  templateUrl: './agency-admin-dashboard.component.html',
  styleUrls: ['./agency-admin-dashboard.component.css'],
  standalone: true,
  imports: [NgChartsModule, CommonModule]
})
export class AgencyAdminDashboardComponent implements OnInit {
  agencyId!: string;
  totalBookings: number = 0;
  totalPackages: number = 0;
  totalRevenue: number = 0;
  agencyBookings: any[] = [];
  agencyTours: any[] = [];
  isBrowser: boolean = false;
  isFabMenuOpen = false;

  // Chart data
  popularToursChartData: any[] = [];
  popularToursChartLabels: string[] = [];
  averageRatingsChartData: any[] = [];
  averageRatingsChartLabels: string[] = [];

  constructor(
    private tourPackagesService: TourPackagesService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;

      // Retrieve agencyId from URL
      this.route.paramMap.subscribe(params => {
        const id = params.get('agencyId');
        if (id) {
          this.agencyId = id;
          this.loadAgencyData();
        } else {
          console.error('Agency ID is missing in the URL');
        }
      });
    }
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  loadAgencyData(): void {
    this.tourPackagesService.getAgencyTours(this.agencyId).subscribe(tours => {
      console.log('Tours:', tours);
      this.agencyTours = tours;
      this.totalPackages = tours.length;
      this.loadAverageRatingsChart(tours); 
  
      this.tourPackagesService.getAllBookings().subscribe(bookings => {
        console.log('All Bookings:', bookings);
  
        // Match bookings with the agency's tours using `TourId`
        const agencyTourIds = tours.map(tour => tour.TourId);
        this.agencyBookings = bookings
          .filter(booking => agencyTourIds.includes(booking.tourId))
          .map(booking => ({
            ...booking,
            amount: parseFloat(booking.amount.replace(/[^\d.]/g, "")) // Convert amount to a number
          }));
  
        console.log('Agency Bookings:', this.agencyBookings);
        this.totalBookings = this.agencyBookings.length;
  
        this.loadPopularToursChart(this.agencyBookings);
        this.calculateTotalRevenue(this.agencyBookings);
      }, error => console.error('Error fetching bookings:', error));
  
    }, error => console.error('Error fetching agency tours:', error));
  }
  

  calculateTotalRevenue(bookings: any[]): void {
    // Ensure the amount is a number before calculating the total revenue
    this.totalRevenue = bookings.reduce((sum, booking) => {
      const amount = booking.amount ? booking.amount : 0;
      return sum + amount;
    }, 0);
  }

  loadPopularToursChart(bookings: any[]): void {
    const tourCounts: { [key: string]: number } = {};
  
    bookings.forEach(booking => {
      if (booking.tourName) {
        tourCounts[booking.tourName] = (tourCounts[booking.tourName] || 0) + 1;
      }
    });
  
    console.log('Tour Counts:', tourCounts);
  
    if (Object.keys(tourCounts).length > 0) {
      this.popularToursChartLabels = Object.keys(tourCounts);
      const randomColors = this.generateRandomColors(Object.keys(tourCounts).length);
  
      this.popularToursChartData = [{
        data: Object.values(tourCounts),
        backgroundColor: randomColors,
        hoverBackgroundColor: randomColors // Set hover background to be the same as regular background
      }];
    }
  }
  

  loadAverageRatingsChart(tours: any[]): void {
    this.averageRatingsChartLabels = tours.map(tour => tour.Name);
    this.averageRatingsChartData = [{
      label: 'Average Rating',
      data: tours.map(tour => tour.Ratings?.AverageRating || 0),
      backgroundColor: '#36A2EB',
      hoverBackgroundColor: '#2592EB'
    }];
  }

  generateRandomColors(count: number): string[] {
    return Array.from({ length: count }, () => `#${Math.floor(Math.random() * 16777215).toString(16)}`);
  }
}
