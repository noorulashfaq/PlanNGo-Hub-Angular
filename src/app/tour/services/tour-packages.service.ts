import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, switchMap } from "rxjs";
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

  // Fetch only tours
  getTourPackages(): Observable<TourPackage[]> {
    return this.http.get<TourPackage[]>(this.toursApiUrl);
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

  // Fetch all agencies
  getAgencies(): Observable<Agencies[]> {
    return this.http.get<Agencies[]>(this.agenciesApiUrl);
  }

  // Fetch agencies by ID
  getAgencyDetails(agencyId: string): Observable<Agencies[]> {
    return this.http.get<Agencies[]>(
      `${this.agenciesApiUrl}?AgencyId=${agencyId}`
    );
  }

  // Fetch tour types
  getTourTypes(): Observable<TourType[]> {
    return this.http.get<TourType[]>(this.tourTypeApiUrl);
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
  deleteBooking(bookingId: string): Observable<void> {
    return this.http.delete<void>(`${this.bookingApiUrl}/${bookingId}`);
  }

  // Function to add a new payment
  addNewPayment(paymentData: any): Observable<any> {
    return this.http.post(this.paymentApiUrl, paymentData);
  }
}
