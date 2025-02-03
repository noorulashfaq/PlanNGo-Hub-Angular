import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyAdminDashboardComponent } from './agency-admin-dashboard.component';

describe('AgencyAdminDashboardComponent', () => {
  let component: AgencyAdminDashboardComponent;
  let fixture: ComponentFixture<AgencyAdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgencyAdminDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgencyAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
