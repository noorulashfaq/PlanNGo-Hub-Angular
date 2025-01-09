import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminAgencyManagementComponent } from './super-admin-agency-management.component';

describe('SuperAdminAgencyManagementComponent', () => {
  let component: SuperAdminAgencyManagementComponent;
  let fixture: ComponentFixture<SuperAdminAgencyManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminAgencyManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperAdminAgencyManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
