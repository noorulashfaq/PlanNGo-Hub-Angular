import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule
import { TourPackagesService } from '../../services/tour-packages.service'; // Import the service
import { HttpClient } from '@angular/common/http';
// Import any necessary Angular modules for standalone components
import { CommonModule } from '@angular/common';
import { error } from 'node:console';

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
  isFabMenuOpen = false;

  //for adding new tour package
  isAddTourModalOpen = false;
  newTour: any = {
    TourId: '',
    Name: '',
    Description: '',
    TourTypeId: null,
    AgencyId: '',
    Route: '',
    Duration: '',
    StartPoint: '',
    EndPoint: '',
    Price: null,
    AvailabilityStatus: '',
    LocationId: '',
    Images: [],
    Inclusions: [] as string[], // Initialize as an empty array
    CancellationPolicy: [] as string[],
    PaymentTermsPolicy: [] as string[],
    Ratings: {
      AverageRating: null,
      TotalReviews: null,
      Reviews: []
    },
    id: ''
  };
  isFileValid: boolean =false; // Set initial value (true or false based on your validation)
  fileTouched: boolean = false;

   // Declare newInclusion to bind to the input field
   newInclusion: string = '';
   newCancellationPolicy: string = '';
   newPaymentTermsPolicy: string = ''; // Added newPaymentTermsPolicy

   
  tourTypes: any[] = []; // Populate with API call
  locations: any[] = []; // Populate with API call

  isDeleteModalOpen = false;
  packageToDelete: any = null; // Holds the agency to delete

  editTours: any = {
    TourId: '',
    Name: '',
    Description: '',
    TourTypeId: null,
    AgencyId: '',
    Route: '',
    Duration: '',
    StartPoint: '',
    EndPoint: '',
    Price: null,
    AvailabilityStatus: '',
    LocationId: '',
    Images: [],
    Inclusions: [] as string[], // Initialize as an empty array
    CancellationPolicy: [] as string[],
    PaymentTermsPolicy: [] as string[],
    Ratings: {
      AverageRating: null,
      TotalReviews: null,
      Reviews: []
    },
    id: ''
  };
  isEditTourModalOpen: boolean = false;



  constructor(
    private route: ActivatedRoute,
    private tourPackagesService: TourPackagesService,
    private http: HttpClient
  ) {}
  

  ngOnInit(): void {
    // Retrieve the 'agencyId' parameter from the route
    this.agencyId = this.route.snapshot.paramMap.get('agencyId')!;
    console.log('Agency ID:', this.agencyId);
    this.fetchPackages();
    this.fetchTourTypes();
    this.fetchLocations();
    console.log('Initial tours data:', this.tours);

  }

  toggleFabMenu(): void {
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  //getting tour types
  fetchTourTypes(): void {
    this.tourPackagesService.getTourTypes().subscribe(
      (data) => {
        console.log('Fetched Tour Types:', data); // Log the response
        this.tourTypes = data; // Assign to the component's variable
      },
      (error) => console.error('Error fetching Tour Types:', error)
    );
  }
  

  //getting locations
  fetchLocations(): void{
    this.tourPackagesService.getLocations().subscribe(
      (data) => {
        this.locations = data
      },
      (error) => console.error('Error fetching locations:',error)
    )
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

   // Open delete confirmation modal
   confirmDeletePackage(agency: any) {
    this.packageToDelete = agency;
    this.isDeleteModalOpen = true;

  }

  // Close delete modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.packageToDelete = null;
  }

  deletePackage() {
    this.tourPackagesService.deletePackage(this.packageToDelete).subscribe(
      () => {
        this.tours = this.tours.filter((tour) => tour.id !== this.packageToDelete);
        this.filteredPackages = this.filteredPackages.filter((tour) => tour.id !== this.packageToDelete);
        this.updatePagination();
        this.showMessage('Success', 'Package deleted successfully!', true);
        this.closeDeleteModal(); // Ensure the modal is closed after deletion.

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

  openAddTourForm() {
    this.newTour = {
      TourId: this.generateTourId(),
      Name: '',
      Description: '',
      TourTypeId: '',
      AgencyId: this.agencyId,
      Route: '',
      Duration: '',
      StartPoint: '',
      EndPoint: '',
      Price: null,
      AvailabilityStatus: '',
      LocationId: '',
      Images: [],
      Inclusions: [] as string[], // Initialize as an empty array
      CancellationPolicy: [] as string[],
      PaymentTermsPolicy: [] as string[],
      Ratings: {
        AverageRating: null,
        TotalReviews: null,
        Reviews: [
        ]
      },
    };
    this.isAddTourModalOpen = true;

  }

  closeAddTourForm() {
    this.isAddTourModalOpen = false;
    console.log('add form canceled');

  }

// Modify the addTour method to handle editing logic as well

addTour(form: any) {
  if (form.valid && this.isFileValid) {
      // Adding a new tour
      this.tourPackagesService.addTour(this.newTour).subscribe(
        (response) => {
          this.filteredPackages.push(response);
          console.log('Tour added successfully:', response);
          this.showMessage('Success', 'Tour Package added successfully!', true);
        },
        (error) => {
          console.error('Error adding tour:', error);
          this.showMessage('Error', 'Failed to add agency. Please try again.', false);
        }
      );
    this.closeAddTourForm(); // Hide form after submission
  }
}


  
  onImageUpload(event: any) {
    const files = event.target.files;
    this.newTour.Images = []; // Clear existing images
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
  
      // Validate the file type
      if (file && file.type.startsWith('image/')) {
        // Use createObjectURL for image preview instead of base64 encoding
        const imageUrl = URL.createObjectURL(file);
        this.newTour.Images.push(imageUrl); // Add image URL to the array
  
        this.isFileValid = true;
        this.fileTouched = true;
      } else {
        this.isFileValid = false;
        this.fileTouched = false;
      }
    }
  }

  
  
  addInclusion(inclusion: string) {
    if (inclusion.trim().length > 0) {
      this.newTour.Inclusions.push(inclusion);
      this.newInclusion = ''; // Clear the input after adding
    }
  }

  removeInclusion(index: number) {
    this.newTour.Inclusions.splice(index, 1);
  }

  addCancellationPolicy(cancelpolicy: string) {
    if (cancelpolicy.trim().length > 0) {
      this.newTour.CancellationPolicy.push(cancelpolicy);
      this.newCancellationPolicy = ''; // Reset input field
    }
  }

  removeCancellationPolicy(index: number) {
    this.newTour.CancellationPolicy.splice(index, 1);
  }

  addPaymentTermsPolicy(policy: string) {
    if (policy.trim().length > 0) {
      this.newTour.PaymentTermsPolicy.push(policy);
      this.newPaymentTermsPolicy = ''; // Reset input field
    }
  }

  removePaymentTermsPolicy(index: number) {
    this.newTour.PaymentTermsPolicy.splice(index, 1);
  }

  generateTourId(): string {
    // Generate unique TourId logic
    return 'TRPKG' + Math.floor(1000 + Math.random() * 9000).toString();
  }


  // Opens the modal and initializes the form
  openEditTourForm(tourData: any) {
    this.isEditTourModalOpen = true;
    this.editTours = { ...tourData }; // Populate the form with existing data
  }

  // Closes the modal
  closeEditTourForm() {
    this.isEditTourModalOpen = false;
  }


  

  updateTour(form: NgForm) {
    if (form.valid) {
      this.tourPackagesService.updateTour(this.editTours.id, this.editTours).subscribe({
        next: (response) => {
          console.log('Agency updated successfully', response);
          this.fetchPackages(); // Refresh the data in the table
          this.closeEditTourForm();
          form.resetForm(); // Reset form after submission
          this.showMessage('Success', 'Tour package updated successfully!',true);
        },
        error: (err) => {
          console.error('Error updating tour:', err);
          this.showMessage('Error', 'Failed to update tour package. Please try again.', false);
        },
        
      });
    }
  }

   // Handles image upload
   onImageUploadd(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // Append new files to the existing array
      Array.from(input.files).forEach((file) => {
        // Validate the file type
        if (file && file.type.startsWith('image/')) {
          const imageUrl = URL.createObjectURL(file); // Create object URL for the image
          // Avoid duplicates by checking if the URL already exists
          if (!this.editTours.Images.includes(imageUrl)) {
            this.editTours.Images.push(imageUrl); // Add image URL to the array
          }
        } else {
          console.error("Invalid file type. Please upload an image.");
        }
      });
    }
  }

  removeImage(index: number): void {
    this.editTours.Images.splice(index, 1);
  }

  // Adds a new inclusion
  addInclusionn(inclusion: string) {
    if (inclusion && inclusion.trim().length >= 5) {
      this.editTours.Inclusions.push(inclusion.trim());
      this.newInclusion = ''; // Clear input field
    }
  }

  // Removes an inclusion
  removeInclusionn(index: number) {
    this.editTours.Inclusions.splice(index, 1);
  }

  // Adds a new cancellation policy
  addCancellationPolicyy(policy: string) {
    if (policy && policy.trim().length >= 5) {
      this.editTours.CancellationPolicy.push(policy.trim());
      this.newCancellationPolicy = ''; // Clear input field
    }
  }

  // Removes a cancellation policy
  removeCancellationPolicyy(index: number) {
    this.editTours.CancellationPolicy.splice(index, 1);
  }

  // Adds a new payment terms policy
  addPaymentTermsPolicyy(policy: string) {
    if (policy && policy.trim().length >= 5) {
      this.editTours.PaymentTermsPolicy.push(policy.trim());
      this.newPaymentTermsPolicy = ''; // Clear input field
    }
  }

  // Removes a payment terms policy
  removePaymentTermsPolicyy(index: number) {
    this.editTours.PaymentTermsPolicy.splice(index, 1);
  }
}

