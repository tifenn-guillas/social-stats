import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MatTabsModule } from '@angular/material/tabs';

import { AppComponent } from './app.component';
import { SseService } from './services/sse.service';
import { of } from 'rxjs';

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
});
