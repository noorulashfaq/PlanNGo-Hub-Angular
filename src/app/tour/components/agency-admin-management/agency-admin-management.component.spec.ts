import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyAdminManagementComponent } from './agency-admin-management.component';

describe('AgencyAdminManagementComponent', () => {
  let component: AgencyAdminManagementComponent;
  let fixture: ComponentFixture<AgencyAdminManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgencyAdminManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgencyAdminManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
