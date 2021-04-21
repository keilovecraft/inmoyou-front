import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Auth
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { environment } from '../environments/environment';
import { FirebaseAuthService } from "./services/firebase.service";
import { EventBusService } from "./services/event.service";

// Routing
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';


/** Elements */
import { ButtonComponent } from './components/elements/button/button.component';
import { MenuComponent } from './components/elements/menu/menu.component';
import { SpinnerComponent } from './components/elements/spinner/spinner.component';

/** Pieces */
import { CardComponent } from './components/pieces/card/card.component';
import { ProfileCardComponent } from './components/pieces/profile-card/profile-card.component';
import { FiltersComponent } from './components/pieces/filters/filters.component';
import { FooterComponent } from './components/pieces/footer/footer.component';
import { HeaderComponent } from './components/pieces/header/header.component';
import { SearchComponent } from './components/pieces/search/search.component';

/** Pages */
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
import { ModalConfirmComponent } from './components/pieces/modal-confirm/modal-confirm.component';

@NgModule({
  declarations: [
    AppComponent,
    AdvertisementsComponent,
    ButtonComponent,
    SpinnerComponent,
    HeaderComponent,
    HomeComponent,
    MenuComponent,
    SearchComponent,
    FooterComponent,
    AdvertisementComponent,
    FiltersComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    CardComponent,
    FavouritesComponent,
    ProfileCardComponent,
    MyAdvertisementsComponent,
    AdministrationComponent,
    AdvertisementCreateComponent,
    ModalConfirmComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    NgxUsefulSwiperModule
  ],
  providers: [
    FirebaseAuthService,
    EventBusService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
