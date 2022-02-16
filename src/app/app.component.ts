import { Component, OnInit } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { SseService } from './services/sse.service';
import { Activity, ChartData, Series } from './models';

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
    data: { network: string, data: ChartData[] }[] = [];
    buffer: Activity[] = [];

    constructor(private sseService: SseService) { }

    /**
     * Starts SSE stream on component initiation and stops it on dirty destroyed page.
     *
     * @param  {any} message - The post to process.
     */
    ngOnInit(): void {
        this.initChartsData();
        this.startSseStream();
        window.onbeforeunload = () => this.stopSseStream();
        interval(5000).subscribe(_ => {
            if (this.sseSubscription) {
                // this.updateChartData();
            }
        });
    }

    /**
     * Inits charts data.
     */
    initChartsData(): void {
        let series: Series[] = [];
        this.weekday.forEach(day => {
            series.push({ name: day, value: 0 });
        });
        let chartData: ChartData[] = [];
        this.hours.forEach(hour => {
            chartData.push({ name: hour, series });
        });
        this.socialNetworks.forEach(network => {
            this.data.push({ network, data: chartData })
        });
    }

    /**
     * Starts SSE stream.
     */
    startSseStream(): void {
        this.sseSubscription = this.sseService
            .getServerSentEvent()
            .subscribe(message => this.checkActivity(JSON.parse(message.data)));
    }

    /**
     * Stops SSE stream.
     */
    stopSseStream(): void {
        this.sseSubscription?.unsubscribe();
        this.sseSubscription = undefined;
    }

    /**
     * Gets data chart for the given network.
     *
     * @param  {string} network - The network.
     *
     * @return ChartData | null
     */
    getData(network: string): ChartData[] | null {
        if (this.data.find(d => d.network === network)) {
            return this.data.find(d => d.network === network)!.data;
        }
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
        if (this.buffer.find(activity => this.isActivitiesMatch(activity, network, day, hour))) {
            // Exclamation point because object is always defined in this case.
            const activity = this.buffer.find(activity => this.isActivitiesMatch(activity, network, day, hour))!;
            const index = this.buffer.findIndex(activity => this.isActivitiesMatch(activity, network, day, hour));
            const newValue: Activity = { network, day, hour, count: activity.count + 1 };
            this.buffer.splice(index, 1, newValue);
        } else {
            this.buffer = [...this.buffer, { network, day, hour, count: 1 }];
        }
    }

    /**
     * Checks if activity match for the given period.
     *
     * @param  {Activity} activity - The activity.
     * @param  {string} network - The social network.
     * @param  {number} day - The day of post.
     * @param  {number} hour - The hour of post.
     * @return boolean
     */
    isActivitiesMatch(activity: Activity, network: string, day: number, hour: number): boolean {
        return activity.network == network && activity.day == day && activity.hour == hour;
    }

    /**
     * Updates data for chart.
     */
    updateChartData(): void {

    }
}
