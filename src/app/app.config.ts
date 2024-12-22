import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),           // Routing configuration
    provideClientHydration(),        // Hydration for SSR
    provideHttpClient(withFetch()),  // Enable fetch API for HttpClient
  ],
};
