import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule
import { TourPackagesService } from '../../services/tour-packages.service'; // Import the service
import { HttpErrorResponse } from '@angular/common/http';
// Import any necessary Angular modules for standalone components
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agency-admin-management',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Import CommonModule to enable common Angular directives like ngIf, ngFor, etc.
  templateUrl: './agency-admin-management.component.html',
  styleUrls: ['./agency-admin-management.component.css']
})
export class AgencyAdminManagementComponent implements OnInit {
  agencyId!: string;

  tours: any[] = [];
  dbUrl = 'path/to/db.json';
  filteredPackages: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  currentPageStart: number = 1;
  currentPageEnd: number = 10;
  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private tourPackagesService: TourPackagesService
  ) {}
  

  ngOnInit(): void {
    // Retrieve the 'agencyId' parameter from the route
    this.agencyId = this.route.snapshot.paramMap.get('agencyId')!;
    console.log('Agency ID:', this.agencyId);
    this.fetchPackages();
    console.log('Initial tours data:', this.tours);

  }

  fetchPackages(): void {
    this.tourPackagesService.getTourPackages().subscribe(
      (data) => {
        // Filter packages that belong to the current agency
        this.tours = data.filter((tour) => tour.AgencyId === this.agencyId);
        this.filteredPackages = this.tours; // Initialize filtered packages
        this.updatePagination();
      },
      (error) => console.error('Error fetching packages:', error)
    );
  }

  updatePagination(): void {
    const totalItems = this.filteredPackages.length;
    this.currentPageStart = (this.currentPage - 1) * this.rowsPerPage + 1;
    this.currentPageEnd = Math.min(this.currentPage * this.rowsPerPage, totalItems);

    if (this.currentPageStart > totalItems) {
      this.currentPage = Math.max(Math.ceil(totalItems / this.rowsPerPage), 1);
      this.updatePagination();
    }
  }


  get paginatedPackages(): any[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.filteredPackages.slice(startIndex, endIndex);
  }
  

  changeRowsPerPage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.rowsPerPage = +selectElement.value;
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  nextPage(): void {
    if (this.currentPage * this.rowsPerPage < this.filteredPackages.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  deletePackage(id: string): void {
    this.tourPackagesService.deletePackage(id).subscribe(
      () => {
        this.tours = this.tours.filter((tour) => tour.id !== id);
        this.filteredPackages = this.filteredPackages.filter((tour) => tour.id !== id);
        this.updatePagination();
        this.showMessage('Success', 'Package deleted successfully!', true);
      },
      (error) => {
        console.error('Error deleting package:', error);
        this.showMessage('Error', 'Failed to delete package. Please try again.', false);
      }
    );
  }

  filterPackages(): void {
    this.currentPage = 1; // Reset to the first page on filtering
    const searchTermLower = this.searchTerm.toLowerCase(); // Normalize search term for case-insensitive search
  
    this.filteredPackages = this.tours.filter((tour) =>
      tour.Name.toLowerCase().includes(searchTermLower) ||
      tour.Duration.toLowerCase().includes(searchTermLower) ||
      tour.Route.toLowerCase().includes(searchTermLower) ||
      tour.StartPoint.toLowerCase().includes(searchTermLower) ||
      tour.EndPoint.toLowerCase().includes(searchTermLower) ||
      tour.Price.toString().toLowerCase().includes(searchTermLower) ||
      tour.AvailabilityStatus.toLowerCase().includes(searchTermLower)
    );
  
    this.updatePagination(); // Update pagination to reflect the filtered list
  }
  

  showMessage(title: string, message: string, isSuccess: boolean): void {
    const dialog = document.createElement('div');
    dialog.className = `fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50`;
    dialog.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6 w-96 text-center space-y-4">
        <h3 class="text-lg font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}">${title}</h3>
        <p class="text-gray-700">${message}</p>
        <button class="px-4 py-2 rounded-md text-white ${
          isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        } focus:outline-none">Close</button>
      </div>`;
    document.body.appendChild(dialog);

    const closeButton = dialog.querySelector('button');
    closeButton?.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }
}

