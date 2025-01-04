import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { TourPackagesService } from "../../services/tour-packages.service";
import {
  Agencies,
  Locations,
  TourPackage,
} from "../../models/tour-package-entities";
import { ActivatedRoute, RouterModule } from "@angular/router";

@Component({
  selector: "app-tour-info",
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  providers: [TourPackagesService],
  templateUrl: "./tour-info.component.html",
  styleUrl: "./tour-info.component.css",
})
export class TourInfoComponent implements OnInit {
  tourId: string | null = null;
  tourDetails: TourPackage | undefined;
  locationDetails: Locations[] = [];
  agencyDetails: Agencies[] = [];
  selectedPackage: any;
  isFabMenuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private tourService: TourPackagesService
  ) {}

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get("id");
    if (this.tourId) {
      this.tourService.getTourPackages().subscribe((data) => {
        this.tourDetails = data.find((tour) => tour.TourId === this.tourId);

        // Fetch the location details if tour is found
        if (this.tourDetails && this.tourDetails.LocationId) {
          this.tourService
            .getLocationDetails(this.tourDetails.LocationId)
            .subscribe((location) => {
              this.locationDetails = location;
            });
        }

        // Fetch the agency details if tour is found
        if (this.tourDetails && this.tourDetails.AgencyId) {
          this.tourService
            .getAgencyDetails(this.tourDetails.AgencyId)
            .subscribe((agency) => {
              this.agencyDetails = agency;
            });
        }
      });
    }
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }
}
