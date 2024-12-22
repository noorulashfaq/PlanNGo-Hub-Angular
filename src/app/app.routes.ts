import { Routes } from "@angular/router";
import { HomepageComponent } from "./tour/components/homepage/homepage.component";
import { TourInfoComponent } from "./tour/components/tour-info/tour-info.component";

export const routes: Routes = [
  { path: "", component: HomepageComponent },
  { path: "tour/:id", component: TourInfoComponent },
];
