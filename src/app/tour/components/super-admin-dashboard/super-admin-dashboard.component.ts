

import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TourPackagesService } from '../../services/tour-packages.service';

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css'],
  standalone: true,
  imports: [NgChartsModule, CommonModule]
})
export class SuperAdminDashboardComponent implements OnInit {

  totalBookingsChart: ChartData<'line'> = { labels: [], datasets: [] };
  popularTourChart: ChartData<'pie'> = { labels: [], datasets: [] };
  popularAgenciesChart: ChartData<'pie'> = { labels: [], datasets: [] };
  bookingTrendsChart: ChartData<'bar'> = { labels: [], datasets: [] };
  revenueChart: ChartData<'bar'> = { labels: [], datasets: [] };  // ✅ Revenue Chart
  paymentMethodsChart: ChartData<'pie'> = { labels: [], datasets: [] };

  totalBookings: number = 0;
  totalAgencies: number = 0;
  totalRevenue: number = 0;
  bookingTrends: any[] = [];
  currentMonthRevenueData: any[] = [];

  revenuePerAgency: { [key: string]: number } = {};

  isBrowser: boolean = false;

  constructor(
    private http: HttpClient,
    private tourPackagesService: TourPackagesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.fetchBookingData();
      this.fetchAgencyData();
      this.fetchRevenueData();
      this.calculateRevenuePerAgency();
    }
  }

  fetchBookingData(): void {
    this.tourPackagesService.getBookings().subscribe(bookings => {
      this.totalBookings = bookings.length;

      this.tourPackagesService.getTourPackages().subscribe(tours => {
        this.popularTourChart = this.preparePopularTourChart(bookings, tours);
        this.bookingTrends = bookings;
      });

      this.tourPackagesService.getPopularAgenciesData().subscribe(agencyData => {
        this.popularAgenciesChart = this.preparePopularAgenciesChart(agencyData);
      });
    });
  }

  fetchAgencyData(): void {
    this.tourPackagesService.getAgencies().subscribe(data => {
      this.totalAgencies = data.length;
    });
  }

  fetchRevenueData(): void {
    this.tourPackagesService.getBookings().subscribe(bookings => {
      this.totalRevenue = bookings.reduce((sum, booking) => {
        if (booking.amount && typeof booking.amount === 'string') {
          const amount = parseFloat(booking.amount.replace('INR ', '').replace(',', ''));
          if (!isNaN(amount)) {
            return sum + amount;
          }
        }
        return sum;
      }, 0);
    });
  }

  preparePopularTourChart(bookings: any[], tours: any[]): ChartData<'pie'> {
    const tourCount: Record<string, number> = {};
    const tourIdToNameMap: Record<string, string> = {};

    tours.forEach(tour => {
      tourIdToNameMap[tour.TourId] = tour.Name;
    });

    bookings.forEach(b => {
      tourCount[b.tourId] = (tourCount[b.tourId] || 0) + 1;
    });

    const labels = Object.keys(tourCount).map(tourId => tourIdToNameMap[tourId] || tourId);
    const data = Object.values(tourCount);
    const dynamicColors = this.generateRandomColors(labels.length);

    return {
      labels: labels,
      datasets: [{
        label: 'Popular Tours',
        data: data,
        backgroundColor: dynamicColors,
        hoverBackgroundColor: dynamicColors,
      }]
    };
  }

  preparePopularAgenciesChart(agencyData: any[]): ChartData<'pie'> {
    const labels = agencyData.map(a => a.agencyName);
    const data = agencyData.map(a => a.bookingCount);

    const dynamicColors = this.generateRandomColors(labels.length);

    return {
      labels: labels,
      datasets: [{
        label: 'Popular Agencies',
        data: data,
        backgroundColor: dynamicColors,
        hoverBackgroundColor: dynamicColors,
      }]
    };
  }

  // ✅ New Function to Prepare the Revenue Chart
  prepareRevenueChart(): void {
    const labels = Object.keys(this.revenuePerAgency);
    const data = Object.values(this.revenuePerAgency);
    const dynamicColors = this.generateRandomColors(labels.length);

    this.revenueChart = {
      labels: labels,
      datasets: [{
        label: 'Revenue (INR)',
        data: data,
        backgroundColor: dynamicColors,
        hoverBackgroundColor: dynamicColors,
      }]
    };
  }

  calculateRevenuePerAgency(): void {
    this.tourPackagesService.getRevenuePerAgencyForCurrentMonth().subscribe((revenueData: { agencyName: string, totalRevenue: number }[]) => {
      revenueData.forEach((data) => {
        this.revenuePerAgency[data.agencyName] = data.totalRevenue;
      });

      // ✅ Prepare the chart after fetching the data
      this.prepareRevenueChart();
    });
  }

  // Helper function to generate random colors
  generateRandomColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    }
    return colors;
  }
}
