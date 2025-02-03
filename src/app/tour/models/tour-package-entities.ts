// Main Model for Tour Package

export interface TourPackage {
  TourId: string;
  Name: string;
  Description: string;
  TourTypeId: string;
  AgencyId: string;
  Route: string;
  Duration: string;
  StartPoint: string;
  EndPoint: string;
  Price: number;
  AvailabilityStatus: string;
  LocationId: string;
  Location: string;
  Images: string[];
  Inclusions: string[];
  CancellationPolicy: string[];
  PaymentTermsPolicy: string;
  Ratings: {
    AverageRating: number;
    TotalReviews: number;
    Reviews: Review[];  // Array of reviews
  };
}

// Separate Review interface for clarity
export interface Review {
  Rating: number;
  Reviewer: string;
  ReviewText: string;
}

export interface Locations {
  LocationId: string;
  Location: string;
}

export interface Agencies {
  AgencyId: string;
  AgencyName: string;
  AgencyLogo: string;
  OfficeLocation: string;
  Phno: string;
  Email: string;
}

export interface TourType {
  TypeId: string;
  Type: string;
}
