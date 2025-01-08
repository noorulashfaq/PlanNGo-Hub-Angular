import { Routes } from "@angular/router";
import { HomepageComponent } from "./tour/components/homepage/homepage.component";
import { TourInfoComponent } from "./tour/components/tour-info/tour-info.component";
import { BookingFormComponent } from "./tour/components/tour-booking/tour-booking.component";

export const routes: Routes = [
  { path: "tours/home", component: HomepageComponent },
  { path: "tours/package/:id", component: TourInfoComponent },
  { path: "tours/package/:id/reserve", component: BookingFormComponent },
];
