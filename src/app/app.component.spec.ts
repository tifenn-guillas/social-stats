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

    it('#startSseStream() should start SSE stream', () => {
        sseServiceMock.getServerSentEvent.and.returnValue(of({
            "data": JSON.stringify({ "data": "This is my data" })
        }));
        spyOn(component, 'checkActivity');

        expect(component.sseSubscription).toBeUndefined();
        expect(component.intervalSubscription).toBeUndefined();
        component.startSseStream();
        expect(component.sseSubscription).toBeTruthy();
        expect(component.intervalSubscription).toBeTruthy();
        expect(component.checkActivity).toHaveBeenCalledTimes(1);
    });

    it('#stopSseStream() should stop SSE stream', () => {
        component.sseSubscription = of().subscribe();
        component.intervalSubscription = of().subscribe();
        expect(component.sseSubscription).toBeTruthy();
        expect(component.intervalSubscription).toBeTruthy();
        component.stopSseStream();
        expect(component.sseSubscription).toBeUndefined();
        expect(component.intervalSubscription).toBeUndefined();
    });

    it('#getNetworkLabel() should return label for the given network', () => {
        expect(component.getNetworkLabel('pin')).toEqual('Pinterest');
    });

    it('#getData(network) should return data for the given network', () => {
        component.activities = [{ network: 'pin', day: 'Monday', hour: '2AM', count: 1 }];
        component.updateChartData();
        expect(component.getData('toto')).toEqual([]);
        expect(component.getData('pin').length).toEqual(24);
        const dataByHour = component.getData('pin').find(d => d.name === '2AM');
        expect(dataByHour).toBeTruthy();
        const dataByDay = dataByHour!.series.find(d => d.name === 'Monday');
        expect(dataByDay).toBeTruthy();
        expect(dataByDay!.value).toEqual(1);
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

    it('#addActivity() should increment activities', () => {
        component.addActivity('myNetwork', 'Monday', '2AM');
        expect(component.activities).toEqual([{ network: 'myNetwork', day: 'Monday', hour: '2AM', count: 1 }]);
        component.addActivity('myNetwork', 'Monday', '2AM');
        expect(component.activities).toEqual([{ network: 'myNetwork', day: 'Monday', hour: '2AM', count: 2 }]);
    });

    it('#isActivitiesMatch() should if activities match or not', () => {
        const activity: Activity = { network: 'myNetwork', day: 'Monday', hour: '2AM', count: 1 };
        expect(component.isActivitiesMatch(activity, 'myNetwork', 'Monday', '2AM')).toBeTrue();
        expect(component.isActivitiesMatch(activity, 'myNetwork', 'Monday', '3AM')).toBeFalse();
    });

    it('#getCount() should return activity count for the given network', () => {
        component.counter = [{ network: 'myNetwork', count: 3 }];
        expect(component.getCount('toto')).toEqual(0);
        expect(component.getCount('myNetwork')).toEqual(3);
    });

    it('#updateCounter() should update activity counter', () => {
        component.activities = [
            { network: 'pin', day: 'Monday', hour: '2AM', count: 1 },
            { network: 'pin', day: 'Monday', hour: '1AM', count: 2 }
        ];
        expect(component.counter).toEqual([]);
        component.updateCounter();
        expect(component.counter).toContain({ network: 'pin', count: 3 });
    });
});
