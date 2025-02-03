import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TourPackagesService } from '../../services/tour-packages.service'; // Ensure the service path is correct

@Component({
  selector: 'app-super-admin-agency-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './super-admin-agency-management.component.html',
  styleUrls: ['./super-admin-agency-management.component.css'],
})
export class SuperAdminAgencyManagementComponent implements OnInit {
  isFabMenuOpen: any;

  agencies: any[] = [];
  filteredAgencies: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  currentPageStart: number = 1;
  currentPageEnd: number = 5;

  // Locations pagination variables
  currentLocationPage: number = 1;
  rowsPerPageLocations: number = 5;
  filteredLocations: any[] = [];
  
  // Tour Types pagination variables
  currentTourTypePage: number = 1;
  rowsPerPageTourTypes: number = 5;
  filteredTourTypes: any[] = [];

  searchTerm: string = '';
  isAddAgencyModalOpen: boolean = false;
  isModalOpen: boolean = false;
  selectedAgency: any = {
    AgencyId: '',
    AgencyName: '',
    Email: '',
    Phno: '',
    AgencyLogo: '',
    OfficeLocation: '',
    id: '',
  };

  newAgency: any = {
    AgencyId: '',
    AgencyName: '',
    Email: '',
    Phno: '',
    AgencyLogo: '',
    OfficeLocation: '',
    id: '',
  };
  isFileValid = false;
  isLogoValid = true;
  fileTouched = false;
  agencyForm: FormGroup;
  selectedFile: File | null = null;

  isDeleteModalOpen = false;
  agencyToDelete: any = null; // Holds the agency to delete

  //locations
  locations: any[] = [];
  newLocationId = '';
  isDeleteLocationModalOpen = false; // To control modal visibility
  newLocation = '';
  locationToDeleteId: string = ''; // To store the ID of the location to delete

  //touttypes manage
  tourTypess: any[] = []; // List of tour types
  isDeleteTourTypeModalOpen = false; // To control modal visibility
  tourTypeToDeleteId: string = ''; // To store the ID of the tour type to delete
  newTourType: string = ''; // To store the new tour type

  constructor(
    private tourPackagesService: TourPackagesService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.agencyForm = this.fb.group({
      AgencyName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Phno: ['', Validators.required],
      OfficeLocation: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.fetchAgencies();
    this.fetchLocations();
    this.fetchTourTypes();
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.agencyForm.valid && this.selectedFile) {
      const newAgency = {
        AgencyId: 'AG' + Math.floor(100 + Math.random() * 900).toString(),
        ...this.agencyForm.value,
        AgencyLogo: 'assets/logos/' + this.selectedFile.name,
      };

      this.http.post('http://localhost:3000/agencies', newAgency).subscribe(() => {
        console.log('Agency added successfully');
        this.agencyForm.reset();
        this.fetchAgencies(); // Refresh agencies list
      });
    }
  }

  onCancel() {
    this.agencyForm.reset();
  }

  fetchAgencies(): void {
    this.tourPackagesService.getAgencies().subscribe(
      (data: any[]) => {
        this.agencies = data;
        this.filteredAgencies = data;
        this.updatePagination();
      },
      (error) => console.error('Error fetching agencies:', error)
    );
  }

  updatePagination(): void {
    const totalItems = this.filteredAgencies.length;
    this.currentPageStart = (this.currentPage - 1) * this.rowsPerPage + 1;
    this.currentPageEnd = Math.min(this.currentPage * this.rowsPerPage, totalItems);

    if (this.currentPageStart > totalItems) {
      this.currentPage = Math.max(Math.ceil(totalItems / this.rowsPerPage), 1);
      this.updatePagination();
    }
  }

  get paginatedAgencies(): any[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.filteredAgencies.slice(startIndex, endIndex);
  }

  changeRowsPerPage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.rowsPerPage = +selectElement.value;
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  nextPage(): void {
    if (this.currentPage * this.rowsPerPage < this.filteredAgencies.length) {
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

    // Open delete confirmation modal
    confirmDeleteAgency(agency: any) {
      this.agencyToDelete = agency;
      this.isDeleteModalOpen = true;

    }
  
    // Close delete modal
    closeDeleteModal() {
      this.isDeleteModalOpen = false;
      this.agencyToDelete = null;
    }

    // Delete the agency
      deleteAgency() {

        this.tourPackagesService.deleteAgency(this.agencyToDelete).subscribe(
          () => {
            this.agencies = this.agencies.filter((agency) => agency.id !== this.agencyToDelete);
            this.filteredAgencies = this.filteredAgencies.filter((agency) => agency.id !== this.agencyToDelete);
            this.updatePagination();
            this.showMessage('Success', 'Agency deleted successfully!', true);
            this.closeDeleteModal(); // Ensure the modal is closed after deletion.

          },
          (error) => {
            console.error('Error deleting agency:', error);
            this.showMessage('Error', 'Failed to delete agency. Please try again.', false);
          }
        );
      }

  filterAgencies(): void {
    this.currentPage = 1;
    this.filteredAgencies = this.agencies.filter((agency) =>
      agency.AgencyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      agency.Email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      agency.Phno.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      agency.OfficeLocation.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.updatePagination();
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

  openAddAgencyForm(): void {
    this.generateAgencyId(); // Generate AgencyId before opening the form
    this.newAgency = {
      AgencyId: this.newAgency.AgencyId,
      AgencyName: '',
      Email: '',
      Phno: '',
      AgencyLogo: '',
      OfficeLocation: '',
      id: ''
    };
    this.isAddAgencyModalOpen = true;
  }
  
  closeAddAgencyForm(): void {
    this.isAddAgencyModalOpen = false;
    console.log('Form canceled');
  }

  addAgency(form: any) {
    if (form.valid && this.isFileValid) {
      // Assign a unique ID if to the backend
    this.newAgency.id = this.newAgency.id || String(Date.now());

      // Submit the form data to the mock JSON API
      this.tourPackagesService.addAgency(this.newAgency).subscribe(
        (response) => {
          this.filteredAgencies.push(response);
          console.log('Agency added successfully', response);
          this.closeAddAgencyForm(); // Close the form after successful submission
          this.showMessage('Success', 'Agency added successfully!',true);
          
        },
        (error) => {
          console.error('Error adding agency:', error);
          this.showMessage('Error', 'Failed to add agency. Please try again.', false);
          this.updatePagination();
        }
      );
    }
  }
   
  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.isFileValid = false;
        console.error('File size exceeds the limit');
        this.showMessage('Error', 'image size exceeds the limit. Please try again.', false);
        return;
      }
      this.isFileValid = true;
      this.fileTouched = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.newAgency.AgencyLogo = URL.createObjectURL(file); // Set image preview as URL
      };
      reader.readAsDataURL(file);
    } else {
      this.isFileValid = false;
      this.showMessage('Error', 'Invalid file selected. Please try again.', false);
    }
  }

  generateAgencyId(): void {
    this.tourPackagesService.getAgencies().subscribe((agencies) => {
      // Find the maximum numeric part of Agency IDs
      const maxId = agencies.reduce((max, agency) => {
        const idNumber = parseInt(agency.AgencyId?.substring(2)) || 0;
        return Math.max(max, idNumber);
      }, 0);
  
      // Increment the numeric part and format the new ID
      const nextId = `AG${String(maxId + 1).padStart(3, '0')}`;
      this.newAgency.AgencyId = nextId;
    });
  }

  openModal(agency: any): void {
    this.selectedAgency = { ...agency };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    console.log('Edit form canceled');
  }

  onFileSelected(event: any) {
    // Logic for handling the file input, including file validation
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedAgency.AgencyLogo = URL.createObjectURL(file); // Set image preview
      this.isLogoValid = true;
    } else {
      this.isLogoValid = false;
    }
    this.fileTouched = false;
  }

  updateAgency() {
    if (this.selectedAgency.AgencyId && this.selectedAgency.AgencyName) {
      // Call the service to update the agency data in the backend
      this.tourPackagesService.updateAgency(this.selectedAgency.id, this.selectedAgency).subscribe(
        (response) => {
          console.log('Agency updated successfully', response);
          this.fetchAgencies(); // Refresh the data in the table

          this.closeModal(); // Close modal after successful update
          this.showMessage('Success', 'Agency updated successfully!',true);
        },
        (error) => {
          console.error('Error updating agency', error);
          this.showMessage('Error', 'Failed to update agency. Please try again.', false);
          this.updatePagination();
        }
      );
    }
  }

  
  //getting locations
  fetchLocations() {
    this.tourPackagesService.getLocations().subscribe((data) => {
      this.locations = data;
      this.filteredLocations = data; // Apply filtering if needed
      this.updateLocationPagination();

    });
  }

  //adding locations
  addLocation() {
    if (this.newLocation.trim()) {
      // Generate the next LocationId
      const nextId = this.generateNextLocationId();
  
      const location = {
        LocationId: nextId,
        Location: this.newLocation,
      };
  
      this.tourPackagesService.addLocation(location).subscribe(() => {
        this.fetchLocations(); // Refresh the list
        this.newLocation = ''; // Clear the input
        console.log('Location added:', location);
      });
    }
  }
  
  generateNextLocationId(): string {
    if (!this.locations || this.locations.length === 0) {
      return 'L001'; // Start with L001 if no locations exist
    }
  
    // Extract numeric parts from LocationId and find the max
    const maxId = Math.max(
      ...this.locations.map(location =>
        parseInt(location.LocationId.replace('L', ''), 10)
      )
    );
  
    // Increment and format the next ID
    const nextIdNumber = maxId + 1;
    return `L${nextIdNumber.toString().padStart(3, '0')}`; // Ensure L001, L002, etc.
  }
  
  //deleting locations

    // Open the modal and set the location ID
    openDeleteLocationModal(locationId: string) {
      this.isDeleteLocationModalOpen = true;
      this.locationToDeleteId = locationId;
    }
  
      // Close delete modal
      closeDeleteLocationModal() {
        this.isDeleteLocationModalOpen = false;
      }

  // Delete the selected location
  deleteLocation() {
    if (this.locationToDeleteId) {
      // Make an API call to delete the location
      this.tourPackagesService.deleteLocation(this.locationToDeleteId).subscribe(() => {
        // After deletion, fetch the updated list of locations
        this.fetchLocations();
        this.closeDeleteLocationModal(); // Close the modal
        this.showMessage('Success', 'Location deleted successfully!', true);
        console.log('Location deleted:', this.locationToDeleteId);
      }, error => {
        console.error('Error deleting location:', error);
        this.showMessage('Error', 'Failed to delete location. Please try again.', false);
      });
    }
  }

  // Open the modal and set the tour type ID to delete
  openDeleteTourTypeModal(tourTypeId: string) {
    this.isDeleteTourTypeModalOpen = true;
    this.tourTypeToDeleteId = tourTypeId;
  }

  // Close the delete confirmation modal
  closeDeleteTourTypeModal() {
    this.isDeleteTourTypeModalOpen = false;
  }

  // Delete the selected tour type
  deleteTourType() {
    if (this.tourTypeToDeleteId) {
      // Make an API call to delete the tour type
      this.tourPackagesService.deleteTourType(this.tourTypeToDeleteId).subscribe(() => {
        // After deletion, fetch the updated list of tour types
        this.fetchTourTypes();
        this.closeDeleteTourTypeModal(); // Close the modal
        console.log('Tour type deleted:', this.tourTypeToDeleteId);
        this.showMessage('Success', 'Tour Type deleted successfully!', true);
      }, error => {
        console.error('Error deleting tour type:', error);
        this.showMessage('Error', 'Failed to delete tour type. Please try again.', false);
      });
    }
  }

  // Add a new tour type
  addTourType() {
    if (this.newTourType.trim()) {
      const newTourType = {
        TypeId: `TYP${('000' + (this.tourTypess.length + 1)).slice(-3)}`,
        Type: this.newTourType
      };

      // Add new tour type to the backend (via API)
      this.tourPackagesService.addTourType(newTourType).subscribe(() => {
        // Fetch updated tour types list after adding
        this.fetchTourTypes();
        this.newTourType = ''; // Reset the input
        console.log('New tour type added:', newTourType);
      }, error => {
        console.error('Error adding tour type:', error);
      });
    }
  }

  // Fetch the tour types from the backend
  fetchTourTypes() {
    this.tourPackagesService.getTourTypes().subscribe(tourTypes => {
      this.tourTypess = tourTypes;
      this.filteredTourTypes = tourTypes;
      this.updateTourTypePagination();
      
    }, error => {
      console.error('Error fetching tour types:', error);
    });
  }

  // Get total pages for locations
  get totalLocationPages(): number {
    return Math.ceil(this.filteredLocations.length / this.rowsPerPageLocations);
  }
  
  // Calculate total pages for tour types
  get totalTourTypePages(): number {
    return Math.ceil(this.filteredTourTypes.length / this.rowsPerPageTourTypes);
  }

  // Update pagination for locations
  updateLocationPagination(): void {
      this.currentLocationPage = 1; // Reset to first page when list changes
  }

  // Update pagination for tour types
  updateTourTypePagination(): void {
    this.currentTourTypePage = 1; // Reset to first page when list changes

  }

// Get paginated locations
get paginatedLocations(): any[] {
  if (!this.filteredLocations.length) return []; // Prevent errors if empty
  const startIndex = (this.currentLocationPage - 1) * this.rowsPerPageLocations;
  const endIndex = startIndex + this.rowsPerPageLocations;
  return this.filteredLocations.slice(startIndex, endIndex);
}

 // Get paginated tour types
get paginatedTourTypes(): any[] {
  if (!this.filteredTourTypes.length) return []; // Prevent errors if empty
  const startIndex = (this.currentTourTypePage - 1) * this.rowsPerPageTourTypes;
  const endIndex = startIndex + this.rowsPerPageTourTypes;
  return this.filteredTourTypes.slice(startIndex, endIndex);
}

  // Change rows per page for locations
  changeRowsPerPageLocations(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.rowsPerPageLocations = +selectElement.value;
    this.currentLocationPage = 1; // Reset to first page
    this.updateLocationPagination();
  }

  // Change rows per page for tour types
  changeRowsPerPageTourTypes(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.rowsPerPageTourTypes = +selectElement.value;
    this.currentTourTypePage = 1; // Reset to first page
    this.updateTourTypePagination();
  }

  // Navigate to next page
nextLocationPage(): void {
  if (this.currentLocationPage < this.totalLocationPages) {
    this.currentLocationPage++;
  }
}

// Navigate to previous page
previousLocationPage(): void {
  if (this.currentLocationPage > 1) {
    this.currentLocationPage--;
  }
}

  // Navigate to next page for tour types
nextTourTypePage(): void {
  if (this.currentTourTypePage < this.totalTourTypePages) {
    this.currentTourTypePage++;
  }
}

  
// Navigate to previous page for tour types
previousTourTypePage(): void {
  if (this.currentTourTypePage > 1) {
    this.currentTourTypePage--;
  }
}

  // Template for pagination controls for locations
  getLocationPaginationControls() {
    return (
      `<button (click)="previousLocationPage()">Previous</button>
      <span>Page {{ currentLocationPage }} of {{ Math.ceil(filteredLocations.length / rowsPerPageLocations) }}</span>
      <button (click)="nextLocationPage()">Next</button>`
    );
  }

  // Template for pagination controls for tour types
  getTourTypePaginationControls() {
    return (
      `<button (click)="previousTourTypePage()">Previous</button>
      <span>Page {{ currentTourTypePage }} of {{ Math.ceil(filteredTourTypes.length / rowsPerPageTourTypes) }}</span>
      <button (click)="nextTourTypePage()">Next</button>`
    );
  }
 
  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }


  }
