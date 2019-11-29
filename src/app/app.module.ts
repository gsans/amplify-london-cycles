import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';
import { MapComponent } from './@core/components/map/map.component';
import { HeaderComponent } from './@core/components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AmplifyAngularModule
  ],
  providers: [
    AmplifyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
