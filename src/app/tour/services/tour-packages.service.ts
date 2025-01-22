import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

import {
  Agencies,
  Locations,
  TourPackage,
  TourType,
} from "../models/tour-package-entities";
import { TourBooking } from "../models/tour-booking-entities";

@Injectable({
  providedIn: "root",
})
export class TourPackagesService {
  getTourPackageById(tourId: string) {
    throw new Error("Method not implemented.");
  }
  private toursApiUrl = "http://localhost:3000/Tours";
  private locationsApiUrl = "http://localhost:3000/Locations";
  private agenciesApiUrl = "http://localhost:3000/Agencies";
  private tourTypeApiUrl = "http://localhost:3000/TourType";
  private bookingApiUrl = "http://localhost:3000/Bookings";
  private paymentApiUrl = "http://localhost:3000/Payments";

  bookTour: any;

  constructor(private http: HttpClient) {}

  // Fetch tours and map with locations
  getToursWithLocations(): Observable<TourPackage[]> {
    return this.http.get<TourPackage[]>(this.toursApiUrl).pipe(
      switchMap((tours) =>
        this.http
          .get<{ LocationId: string; Location: string }[]>(this.locationsApiUrl)
          .pipe(
            map((locations) => {
              // Map LocationId in tours to Location name
              return tours.map((tour) => ({
                ...tour,
                Location:
                  locations.find(
                    (loc: { LocationId: any }) =>
                      loc.LocationId === tour.LocationId
                  )?.Location || "Unknown",
              }));
            })
          )
      )
    );
  }

  // Fetch only locations
  getLocations(): Observable<{ LocationId: string; Location: string }[]> {
    return this.http.get<{ LocationId: string; Location: string }[]>(
      this.locationsApiUrl
    );
  }

  // Fetch location by ID
  getLocationDetails(locationId: string): Observable<Locations[]> {
    return this.http.get<Locations[]>(
      `${this.locationsApiUrl}?LocationId=${locationId}`
    );
  }

  // Fetch agencies by ID
  getAgencyDetails(agencyId: string): Observable<Agencies[]> {
    return this.http.get<Agencies[]>(
      `${this.agenciesApiUrl}?AgencyId=${agencyId}`
    );
  }

  // Fetch tour types
  getTourTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.tourTypeApiUrl);
  }
  // Fetch all bookings
  getAllBookings(): Observable<TourBooking[]> {
    return this.http.get<TourBooking[]>(this.bookingApiUrl);
  }

  // Fetch booking by ID
  getBookingById(bookingId: string): Observable<TourBooking> {
    return this.http.get<TourBooking>(`${this.bookingApiUrl}/${bookingId}`);
  }

  // Add a new booking
  createBooking(bookingData: TourBooking): Observable<TourBooking> {
    return this.http.post<TourBooking>(this.bookingApiUrl, bookingData);
  }

  // Update an existing booking
  updateBooking(
    bookingId: string,
    updatedData: Partial<TourBooking>
  ): Observable<any> {
    return this.http.put<any>(
      `${this.bookingApiUrl}/${bookingId}`,
      updatedData
    );
  }

  // Delete a booking
  deleteBooking(bookedId: string): Observable<void> {
    return this.http.delete<void>(`${this.bookingApiUrl}/${bookedId}`).pipe(
      catchError((error) => {
        console.error('Error deleting booking:', error);
        return throwError('Failed to delete booking. Please try again later.');
      })
    );
  }

  // Function to add a new payment
  addNewPayment(paymentData: any): Observable<any> {
    return this.http.post(this.paymentApiUrl, paymentData);
  }

  // Fetch total bookings
  getTotalBookings(): Observable<number> {
    return this.getAllBookings().pipe(map((bookings) => bookings.length));
  }

  // Fetch total revenue
  getTotalRevenue(): Observable<number> {
    return this.getAllBookings().pipe(
      map((bookings) =>
        bookings.reduce((sum, booking) => {
          const amount = parseFloat(
            booking.amount.replace("INR ", "").replace(",", "")
          );
          return !isNaN(amount) ? sum + amount : sum;
        }, 0)
      )
    );
  }

  // Fetch bookings grouped by tour for Popular Tours Chart
  getPopularToursData(): Observable<{ [key: string]: number }> {
    return this.getAllBookings().pipe(
      map((bookings) => {
        const tourCount: Record<string, number> = {};
        bookings.forEach((b) => {
          tourCount[b.tourId] = (tourCount[b.tourId] || 0) + 1;
        });
        return tourCount;
      })
    );
  }

  // Fetch revenue data grouped by date for Revenue Chart
  getRevenueByDate(): Observable<{ [key: string]: number }> {
    return this.getAllBookings().pipe(
      map((bookings) => {
        const revenueByDate: Record<string, number> = {};
        bookings.forEach((b) => {
          const dateKey = new Date(b.createdAt).toISOString().split("T")[0];
          const amount = parseFloat(
            b.amount.replace("INR ", "").replace(",", "")
          );
          revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + amount;
        });
        return revenueByDate;
      })
    );
  }

  // Fetch booking trends by month
  getBookingTrendsByMonth(): Observable<{ [key: string]: number }> {
    return this.getAllBookings().pipe(
      map((bookings) => {
        const bookingsByMonth: Record<string, number> = {};
        bookings.forEach((b) => {
          const month = new Date(b.createdAt).toLocaleString("default", {
            month: "long",
          });
          bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
        });
        return bookingsByMonth;
      })
    );
  }
  // Method to get bookings from db.json
  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(this.bookingApiUrl);
  }

  getPopularAgenciesData(): Observable<any[]> {
    return forkJoin({
      bookings: this.getBookings(),
      agencies: this.getAgencies(),
    }).pipe(
      map((response) => {
        const { bookings, agencies } = response;
        const agencyCount: Record<string, number> = {};

        // Group bookings by agencyId and count the number of bookings for each agency
        bookings.forEach((b) => {
          if (b.agencyId) {
            agencyCount[b.agencyId] = (agencyCount[b.agencyId] || 0) + 1;
          }
        });

        // Create an object with agencyId, bookingCount, and agencyName
        const agencyData = Object.keys(agencyCount).map((agencyId) => {
          const agency = agencies.find((a) => a.AgencyId === agencyId);
          return {
            agencyId,
            bookingCount: agencyCount[agencyId],
            agencyName: agency ? agency.AgencyName : "Unknown",
          };
        });

        return agencyData;
      })
    );
  }

  getRevenuePerAgencyForCurrentMonth(): Observable<
    { agencyName: string; totalRevenue: number }[]
  > {
    return forkJoin({
      bookings: this.getBookings(),
      agencies: this.getAgencies(),
    }).pipe(
      map(({ bookings, agencies }) => {
        const currentMonth = new Date().getMonth();
        const revenuePerAgency: { [key: string]: number } = {};

        // Map for quick lookup of agency names
        const agencyMap = new Map<string, string>();
        agencies.forEach((agency) => {
          agencyMap.set(agency.AgencyId, agency.AgencyName);
        });

        bookings.forEach((booking) => {
          // ✅ Safely parse the booking date
          const bookingDate = booking?.departureDate
            ? new Date(booking.departureDate)
            : null;

          if (bookingDate && bookingDate.getMonth() === currentMonth) {
            // ✅ Safe lookup for agency name
            const agencyName =
              agencyMap.get(booking.agencyId) || "Unknown Agency";

            // ✅ Safely parse amount with fallback to 0
            const amount = this.parseAmount(booking.amount);

            // ✅ Initialize if undefined
            if (!revenuePerAgency[agencyName]) {
              revenuePerAgency[agencyName] = 0;
            }

            revenuePerAgency[agencyName] += amount;
          }
        });

        // ✅ Return the result as an array of objects
        return Object.keys(revenuePerAgency).map((agencyName) => ({
          agencyName,
          totalRevenue: revenuePerAgency[agencyName],
        }));
      })
    );
  }

  /**
   * ✅ Helper method to safely parse the booking amount
   */
  private parseAmount(amount: any): number {
    if (typeof amount === "string") {
      return parseFloat(amount.replace("INR ", "").replace(/,/g, "")) || 0;
    }
    return 0;
  }

  // Add a new agency
  addAgency(agencyData: any): Observable<any> {
    return this.http.post<any>(this.agenciesApiUrl, agencyData);
  }

  // Update an existing agency
  updateAgency(id: string, agencyData: any): Observable<any> {
    return this.http.put<any>(`${this.agenciesApiUrl}/${id}`, agencyData);
  }

  // Delete an agency
  deleteAgency(id: string): Observable<void> {
    return this.http.delete<void>(`${this.agenciesApiUrl}/${id}`);
  }

  // Fetch all agencies
  getAgencies(): Observable<Agencies[]> {
    return this.http.get<Agencies[]>(this.agenciesApiUrl);
  }

  // Fetch only tours
  getTourPackages(): Observable<TourPackage[]> {
    return this.http.get<TourPackage[]>(this.toursApiUrl);
  }

     // Add a new tour
  addTour(newTour: any): Observable<any> {
    return this.http.post(this.toursApiUrl, newTour);
  }

  // Delete an agency
  deletePackage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.toursApiUrl}/${id}`);
  }

 
  // Update an existing tour
  updateTour(id: string, tourData: any): Observable<any> {
    return this.http.put<any>(`${this.toursApiUrl}/${id}`, tourData);
  }

  // Fetch bookings for a specific user
  getUserBookings(userId: string): Observable<TourBooking[]> {
    return this.http
      .get<TourBooking[]>(`${this.bookingApiUrl}?userId=${userId}`)
      .pipe(
        map((bookings) => {
          // Sort bookings by date, assuming the bookingDate is in ISO format
          return bookings.sort(
            (a, b) =>
              new Date(b.bookingDate).getTime() -
              new Date(a.bookingDate).getTime()
          );
        })
      );
  }
}
