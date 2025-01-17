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
  agencies: any[] = [];
  filteredAgencies: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  currentPageStart: number = 1;
  currentPageEnd: number = 10;
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

  deleteAgency(id: string): void {
    this.tourPackagesService.deleteAgency(id).subscribe(
      () => {
        this.agencies = this.agencies.filter((agency) => agency.id !== id);
        this.filteredAgencies = this.filteredAgencies.filter((agency) => agency.id !== id);
        this.updatePagination();
        this.showMessage('Success', 'Agency deleted successfully!', true);
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

  }
