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
  deleteBooking(bookingId: string): Observable<void> {
    return this.http.delete<void>(`${this.bookingApiUrl}/${bookingId}`);
  }

  // Function to add a new payment
  addNewPayment(paymentData: any): Observable<any> {
    return this.http.post(this.paymentApiUrl, paymentData);
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
}

