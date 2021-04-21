import { NgModule } from '@angular/core';
// import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { HomeComponent } from './components/pages/home/home.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { AdvertisementsComponent } from './components/pages/advertisements/advertisements.component';
import { AdvertisementComponent } from './components/pages/advertisement/advertisement.component';
import { AdvertisementCreateComponent } from './components/pages/advertisement-create/advertisement-create.component';
import { MyAdvertisementsComponent } from './components/pages/my-advertisements/my-advertisements.component';
import { FavouritesComponent } from './components/pages/favourites/favourites.component';
import { AdministrationComponent } from './components/pages/administration/administration.component';

import { AuthGuard } from './app.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'advertisements',
    component: AdvertisementsComponent
  },
  {
    path: 'advertisement/:id',
    component: AdvertisementComponent
  },
  {
    path: 'advertisement-create',
    component: AdvertisementCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'advertisement-edit/:id',
    component: AdvertisementCreateComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-advertisements',
    component: MyAdvertisementsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'favourites',
    component: FavouritesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: HomeComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
