import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { SseService } from './services/sse.service';
import { Activity, ChartData } from './models';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    sseSubscription: Subscription | undefined;
    readonly socialNetworks = ['pin', 'instagram_media', 'youtube_video', 'article', 'tweet', 'facebook_status'];
    readonly weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    readonly hours = ['12PM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12AM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];
    buffer: Activity[] = [];

    constructor(private sseService: SseService) { }

    ngOnInit(): void {
        this.startSseStream();
        window.onbeforeunload = () => this.stopSseStream();
    }

    startSseStream(): void {
        this.sseSubscription = this.sseService
            .getServerSentEvent()
            .subscribe(message => this.checkActivity(JSON.parse(message.data)));
    }

    stopSseStream(): void {
        this.sseSubscription?.unsubscribe();
    }

    getData(network: string): ChartData | null {
        return null;
    }

    /**
     * Extracts and adds post info.
     *
     * @param  {any} message - The post to process.
     */
    checkActivity(message: any) : void {
        let day: number;
        let hour: number;
        const network: string | undefined = Object.keys(message)[0];
        if (network) {
            [day, hour] = this.extractDayAndHour(message[network].timestamp);
            this.addActivity(network, day, hour);
        }
    }

    /**
     * Extracts day and hour of post from timestamp.
     *
     * @param  {number} timestamp - The timestamp.
     * @return [number, number]
     */
    extractDayAndHour(timestamp: number): [number, number] {
        const date: Date = new Date(timestamp);
        return [date.getDay(), date.getHours()];
    }

    /**
     * Increments activity count.
     *
     * @param  {string} network - The social network.
     * @param  {number} day - The day of post.
     * @param  {number} hour - The hour of post.
     */
    addActivity(network: string, day: number, hour: number): void {
        if (this.buffer.find(activity => this.isActivitiesExist(activity, network, day, hour))) {
            // Exclamation point because object is always defined in this case.
            const activity = this.buffer.find(activity => this.isActivitiesExist(activity, network, day, hour))!;
            const index = this.buffer.findIndex(activity => this.isActivitiesExist(activity, network, day, hour));
            const newValue: Activity = { network, day, hour, count: activity.count + 1 };
            this.buffer.splice(index, 1, newValue);
        } else {
            this.buffer = [...this.buffer, { network, day, hour, count: 1 }];
        }
        console.log(this.buffer);
    }

    /**
     * Checks if activity already exist for the given period.
     *
     * @param  {Activity} activity - The activity.
     * @param  {string} network - The social network.
     * @param  {number} day - The day of post.
     * @param  {number} hour - The hour of post.
     * @return boolean
     */
    isActivitiesExist(activity: Activity, network: string, day: number, hour: number): boolean {
        return activity.network == network && activity.day == day && activity.hour == hour;

    }
}
