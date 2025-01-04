import { Component, HostListener, OnInit } from "@angular/core";
import { TourPackagesService } from "../../services/tour-packages.service";
import {
  TourPackage,
  Locations,
  Agencies,
  TourType,
} from "../../models/tour-package-entities";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-homepage",
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  providers: [TourPackagesService],
  templateUrl: "./homepage.component.html",
  styleUrl: "./homepage.component.css",
})
export class HomepageComponent implements OnInit {
  tourPackages: TourPackage[] = [];
  locations: Locations[] = [];
  dropdownOptions: string[] = [];
  selectedLocations: Set<string> = new Set();
  dropdownOpen: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  loading: boolean = false;
  agencies: Agencies[] = [];
  selectedAgency: string = "";
  tourTypes: TourType[] = [];
  selectedTourType: string = "";
  isFabMenuOpen = false;

  constructor(private tourService: TourPackagesService) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem("userId", "USR001");
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    await this.sleep(2000); // Simulate delay

    this.tourService.getToursWithLocations().subscribe(
      (data) => {
        this.tourPackages = data;
        this.loading = false;
      },
      (error) => {
        console.error("Error fetching tour packages", error);
        this.loading = false;
      }
    );

    this.tourService.getLocations().subscribe(
      (data) => {
        this.locations = data;
        this.dropdownOptions = [...new Set(data.map((tour) => tour.Location))];
        this.loading = false;
      },
      (error) => {
        console.error("Error fetching locations", error);
        this.loading = false;
      }
    );

    this.tourService.getAgencies().subscribe(
      (data) => {
        this.agencies = data;
        this.loading = false;
      },
      (error) => {
        console.error("Error fetching agencies", error);
        this.loading = false;
      }
    );

    // Fetch tour types
    this.tourService.getTourTypes().subscribe(
      (data) => {
        this.tourTypes = data;
        this.loading = false;
      },
      (error) => {
        console.error("Error fetching tour types", error);
        this.loading = false;
      }
    );
  }

  get selectedLocationsString(): string {
    return this.selectedLocations.size > 0
      ? [...this.selectedLocations].join(", ")
      : "Select locations";
  }

  get filteredTours(): TourPackage[] {
    let tours = this.tourPackages;

    // Filter by selected locations
    if (this.selectedLocations.size > 0) {
      tours = tours.filter((tour) => this.selectedLocations.has(tour.Location));
    }

    // Filter by selected agency
    if (this.selectedAgency) {
      tours = tours.filter((tour) => tour.AgencyId === this.selectedAgency);
    }

    // Filter by tour type
    if (this.selectedTourType) {
      tours = tours.filter((tour) => tour.TourTypeId === this.selectedTourType);
    }

    return tours;
  }

  get paginatedTours(): TourPackage[] {
    const filtered = this.filteredTours;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTours.length / this.itemsPerPage);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  async navigateToPage(page: number): Promise<void> {
    if (page >= 1 && page <= this.totalPages) {
      this.loading = true;
      await this.sleep(1500);
      this.currentPage = page;
      this.loading = false;
    }
  }

  async toggleSelection(location: string): Promise<void> {
    this.loading = true;

    if (this.selectedLocations.has(location)) {
      this.selectedLocations.delete(location);
    } else {
      this.selectedLocations.add(location);
    }

    await this.sleep(1500);
    this.loading = false;
  }

  isSelected(location: string): boolean {
    return this.selectedLocations.has(location);
  }

  async clearSelection(): Promise<void> {
    this.loading = true;
    this.selectedLocations.clear();
    this.selectedAgency = "";
    this.selectedTourType = "";
    await this.sleep(1000);
    this.loading = false;
  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  @HostListener("document:click", ["$event"])
  handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".dropdown-container")) {
      this.dropdownOpen = false;
    }
  }
}
