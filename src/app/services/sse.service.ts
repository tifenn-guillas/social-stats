import { Injectable, NgZone } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SseService {
    constructor(private _zone: NgZone) { }

    /**
     * Get stream data.
     *
     * @return Observable<any>
     */
    getServerSentEvent(): Observable<any> {
        return new Observable((observer: any) => {
            const eventSource = new EventSource('https://stream.upfluence.co/stream');
            eventSource.onmessage = event => {
                this._zone.run(() => {
                    observer.next(event);
                });
            };
            eventSource.onerror = error => {
                this._zone.run(() => {
                    observer.error(error);
                });
            };
        });
    }
}
