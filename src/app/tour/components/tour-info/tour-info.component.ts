import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { TourPackagesService } from "../../services/tour-packages.service";
import { Agencies, Locations, TourPackage } from "../../models/tour-package-entities";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-tour-info",
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  providers: [TourPackagesService],
  templateUrl: "./tour-info.component.html",
  styleUrls: ["./tour-info.component.css"],
})
export class TourInfoComponent implements OnInit {
  // Index signature to allow dynamic properties
  [x: string]: any;

  // Properties for tour details, reviews, agency, and location details
  tourId: string | null = null;
  tourDetails: TourPackage | undefined;
  locationDetails: Locations[] = [];
  agencyDetails: Agencies[] = [];
  userReviews: { Reviewer: string; Rating: number; ReviewText: string }[] = [];

  // User inputs for adding reviews
  userRating: number = 0;
  userReviewText: string = "";
  selectedPackage: any;

  // Controls for the FAB menu state
  isFabMenuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private tourService: TourPackagesService
  ) {}

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get("id");

    // Ensure tourId is available before fetching data
    if (this.tourId) {
      this.fetchTourDetails();
      this.fetchTourReviews(); // Fetch reviews for the tour
    } else {
      console.error("Tour ID is missing.");
    }
  }

  // Fetch details for the selected tour package
  private fetchTourDetails(): void {
    this.tourService.getTourPackages().subscribe(
      (data) => {
        this.tourDetails = data.find((tour) => tour.TourId === this.tourId) ?? undefined;

        if (this.tourDetails) {
          this.loadAdditionalDetails();
        } else {
          console.error("Tour details not found for ID:", this.tourId);
        }
      },
      (error) => {
        console.error("Error fetching tour packages:", error);
      }
    );
  }

  // Load additional details like agency and location information for the tour
  private loadAdditionalDetails(): void {
    if (this.tourDetails?.LocationId) {
      this.tourService.getLocationDetails(this.tourDetails.LocationId).subscribe(
        (location) => {
          this.locationDetails = location ?? [];
        },
        (error) => {
          console.error("Error fetching location details:", error);
        }
      );
    }

    if (this.tourDetails?.AgencyId) {
      this.tourService.getAgencyDetails(this.tourDetails.AgencyId).subscribe(
        (agency) => {
          this.agencyDetails = agency ?? [];
        },
        (error) => {
          console.error("Error fetching agency details:", error);
        }
      );
    }
  }

  // Fetch reviews for the specific tour package
  private fetchTourReviews(): void {
    if (this.tourId) {
      this.tourService.getReviewsByTourId(this.tourId).subscribe(
        (reviews) => {
          this.userReviews = reviews ?? [];
        },
        (error) => {
          console.error("Error fetching reviews:", error);
        }
      );
    }
  }

  // Toggle the FAB menu state
  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  // Set the user rating for review
  setUserRating(rating: number): void {
    this.userRating = rating;
  }

  // Submit the user's review for the tour package
  submitReview(): void {
    if (this.userRating === 0 || !this.userReviewText.trim()) {
      alert("Please provide a rating and review text.");
      return;
    }

    if (!this.tourId) {
      alert("Tour ID is missing.");
      return;
    }

    const newReview = {
      tourId: this.tourId, // Include tourId to associate the review with a tour
      Reviewer: "Anonymous", // Placeholder name
      Rating: this.userRating,
      ReviewText: this.userReviewText.trim(),
    };

    this.addReview(newReview);
  }

  // Add the review to the server and update the UI
  private addReview(newReview: { tourId: string; Reviewer: string; Rating: number; ReviewText: string }): void {
    this.tourService.addReview(newReview).subscribe(
      (response) => {
        alert("Your review has been submitted!");
        // After review is successfully added, push the review to the UI
        this.userReviews.push(response);
        this.userRating = 0;
        this.userReviewText = "";
      },
      (error) => {
        console.error("Error submitting review:", error);
        alert("There was an error submitting your review.");
      }
    );
  }
}
