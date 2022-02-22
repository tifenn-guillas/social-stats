import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {
    let component: ChartComponent;
    let fixture: ComponentFixture<ChartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChartComponent],
            imports: [NgxChartsModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });
});
