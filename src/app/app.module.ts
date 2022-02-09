import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { SseService } from './services/sse.service';

@NgModule({
    declarations: [
        AppComponent,
        ChartComponent
    ],
    imports: [
        MatTabsModule,
        NgxChartsModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule
    ],
    providers: [SseService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
