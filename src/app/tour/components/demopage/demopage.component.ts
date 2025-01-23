import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demopage',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './demopage.component.html',
  styleUrl: './demopage.component.css'
})
export class DemopageComponent {
  selectedRole: string = 'end-user'; // Default role

  constructor(private router: Router) {}

  onLogin(): void {
    switch (this.selectedRole) {
      case 'end-user':
        this.router.navigate(['/tours/home']);
        break;
      case 'admin':
        this.router.navigate(['tours/agencyadmin/AG001/dashboard/packages']);
        break;
      case 'super-admin':
        this.router.navigate(['tours/superadmin/dashboard']);
        break;
      default:
        console.error('Invalid role selected');
    }
  }
}
