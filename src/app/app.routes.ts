import { Routes } from "@angular/router";
import { HomepageComponent } from "./tour/components/homepage/homepage.component";
import { TourInfoComponent } from "./tour/components/tour-info/tour-info.component";
import { BookingFormComponent } from "./tour/components/tour-booking/tour-booking.component";
import { MyBookingsComponent } from "./tour/components/my-bookings/my-bookings.component";
import { SuperAdminDashboardComponent } from "./tour/components/super-admin-dashboard/super-admin-dashboard.component";
import { SuperAdminAgencyManagementComponent } from "./tour/components/super-admin-agency-management/super-admin-agency-management.component";

export const routes: Routes = [
  { path: "tours/home", component: HomepageComponent },
  { path: "tours/package/:id", component: TourInfoComponent },
  { path: "tours/package/:id/reserve", component: BookingFormComponent },
  { path: "tours/my-bookings", component: MyBookingsComponent },
  { path: "tours/superadmin/dashboard", component: SuperAdminDashboardComponent },
  { path: "tours/superadmin/dashboard/agencies", component: SuperAdminAgencyManagementComponent },
];
