import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MatTabsModule } from '@angular/material/tabs';

import { AppComponent } from './app.component';
import { SseService } from './services/sse.service';
import { of } from 'rxjs';
import { Activity } from './models';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let sseServiceMock: any;
    sseServiceMock = jasmine.createSpyObj(['getServerSentEvent']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatTabsModule
            ],
            declarations: [AppComponent],
            providers: [{ provide: SseService, useValue: sseServiceMock }]
        }).compileComponents();
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call #startSseStream() on component initialization', () => {
        spyOn(component, 'startSseStream');
        component.ngOnInit();
        expect(component.startSseStream).toHaveBeenCalledTimes(1);
    });

    it('#initChartsData() should initiate data chart foreach network', () => {
        expect(component.data.length).toEqual(0);
        component.initChartsData();
        expect(component.data.length).toEqual(6);
        const byHour = component.data.find(d => d.network === 'pin')!.data;
        expect(byHour.length).toEqual(24);
        const byDay = byHour.find(h => h.name === '12PM')!.series;
        expect(byDay.length).toEqual(7);
    });

    it('#startSseStream() should start SSE stream', () => {
        sseServiceMock.getServerSentEvent.and.returnValue(of({
            "data": JSON.stringify({ "data": "This is my data" })
        }));
        spyOn(component, 'checkActivity');
        expect(component.sseSubscription).toBeUndefined();
        component.startSseStream();
        expect(component.sseSubscription).toBeTruthy();
        expect(component.checkActivity).toHaveBeenCalledTimes(1);
    });

    it('#stopSseStream() should stop SSE stream', () => {
        component.sseSubscription = of().subscribe();
        expect(component.sseSubscription).toBeTruthy();
        component.stopSseStream();
        expect(component.sseSubscription).toBeUndefined();
    });

    it('#getData(network) should return null if no data for the given network', () => {
        // expect(component.getData('pin')).toBeNull();
    });

    it('#getData(network) should return data for the given network', () => {
        component.initChartsData();
        const expected = component.data.find(d => d.network === 'pin')!.data;
        expect(component.getData('pin')).toEqual(expected);
    });

    it('#checkActivity(message) should check message validity', () => {
        spyOn(component, 'addActivity');
        component.checkActivity('');
        expect(component.addActivity).toHaveBeenCalledTimes(0);
        component.checkActivity({ 'network': 'myNetwork' });
        expect(component.addActivity).toHaveBeenCalledTimes(1);
    });

    it('#extractDayAndHour(timestamp) should extract day and hour from the given timestamp', () => {
        expect(component.extractDayAndHour(1550415600000)).toEqual(['Sunday', '3PM']);
    });

    it('#addActivity() should increment activity to the buffer', () => {
        component.addActivity('myNetwork', 'Monday', '2AM');
        expect(component.buffer).toEqual([{ network: 'myNetwork', day: 'Monday', hour: '2AM', count: 1 }]);
        component.addActivity('myNetwork', 'Monday', '2AM');
        expect(component.buffer).toEqual([{ network: 'myNetwork', day: 'Monday', hour: '2AM', count: 2 }]);
    });

    it('#isActivitiesMatch() should if activities match or not', () => {
        const activity: Activity = { network: 'myNetwork', day: 'Monday', hour: '2AM', count: 1 };
        expect(component.isActivitiesMatch(activity, 'myNetwork', 'Monday', '2AM')).toBeTrue();
        expect(component.isActivitiesMatch(activity, 'myNetwork', 'Monday', '3AM')).toBeFalse();
    });
});
