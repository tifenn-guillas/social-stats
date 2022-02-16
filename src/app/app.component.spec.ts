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
        component.startSseStream();
        expect(component.sseSubscription).toBeTruthy();
        expect(component.checkActivity).toHaveBeenCalledTimes(1);
    });

    it('#stopSseStream() should stop SSE stream', () => {
        component.sseSubscription = of().subscribe();
        expect(component.sseSubscription).toBeTruthy();
        component.stopSseStream();
        expect(component.sseSubscription.closed).toBeTrue();
    });

    it('#getData(network) should return null if no data for the given network', () => {
        expect(component.getData('toto')).toBeNull();
    });

    it('#getData(network) should return data for the given network', () => {
    });

    it('#checkActivity(message) should check message validity', () => {
        spyOn(component, 'addActivity');
        component.checkActivity('');
        expect(component.addActivity).toHaveBeenCalledTimes(0);
        component.checkActivity({ 'network': 'myNetwork' });
        expect(component.addActivity).toHaveBeenCalledTimes(1);
    });

    it('#extractDayAndHour(timestamp) should extract day and hour from the given timestamp', () => {
        expect(component.extractDayAndHour(1550415600000)).toEqual([0, 15]);
    });

    it('#addActivity() should increment activity to the buffer', () => {
        component.addActivity('myNetwork', 1, 2);
        expect(component.buffer).toEqual([{ network: 'myNetwork', day: 1, hour: 2, count: 1 }]);
        component.addActivity('myNetwork', 1, 2);
        expect(component.buffer).toEqual([{ network: 'myNetwork', day: 1, hour: 2, count: 2 }]);
    });

    it('#isActivitiesMatch() should if activities match or not', () => {
        const activity: Activity = { network: 'myNetwork', day: 1, hour: 2, count: 1 };
        expect(component.isActivitiesMatch(activity, 'myNetwork', 1, 2)).toBeTrue();
        expect(component.isActivitiesMatch(activity, 'myNetwork', 1, 3)).toBeFalse();
    });
});
