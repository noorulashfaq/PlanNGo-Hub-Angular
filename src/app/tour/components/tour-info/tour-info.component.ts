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
  tourId: string | null = null;
  tourDetails: TourPackage | undefined;
  locationDetails: Locations[] = [];
  agencyDetails: Agencies[] = [];
  selectedPackage: any;
  isFabMenuOpen = false;

  // For adding reviews
  userRating: number = 0;
  userReviewText: string = "";
  userReviews: { Reviewer: string; Rating: number; ReviewText: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private tourService: TourPackagesService
  ) {}

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get("id");
    
    // Ensure tourId is available before fetching data
    if (this.tourId) {
      this.fetchTourDetails();
    } else {
      console.error("Tour ID is missing.");
    }
  }

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

    // Load existing reviews if available
    this.userReviews = this.tourDetails?.Ratings?.Reviews ?? [];
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  setUserRating(rating: number): void {
    this.userRating = rating;
  }

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
