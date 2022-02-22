import { Component, OnInit } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { SseService } from './services/sse.service';
import { Activity,  ChartData, ChartDataByNetwork, Counter, Series } from './models';
import { NetworksTable, DaysTable, HoursTable } from './utils';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    sseSubscription: Subscription | undefined;
    intervalSubscription: Subscription | undefined;
    networks: string[] = Object.keys(NetworksTable);
    activities: Activity[] = [];
    chartData: ChartDataByNetwork[] = [];
    counter: Counter[] = [];

    constructor(private sseService: SseService) { }

    /**
     * Starts SSE stream on component initiation and stops it on dirty destroyed page.
     */
    ngOnInit(): void {
        this.startSseStream();
        window.onbeforeunload = () => this.stopSseStream();
    }

    /**
     * Starts SSE stream and update chart data regularly.
     */
    startSseStream(): void {
        this.sseSubscription = this.sseService
            .getServerSentEvent()
            .subscribe(message => this.checkActivity(JSON.parse(message.data)));
        this.intervalSubscription = interval(5000)
            .subscribe(_ => {
                if (this.sseSubscription) {
                    this.updateChartData();
                    this.updateCounter();
                }
            }
        );
    }

    /**
     * Stops SSE stream.
     */
    stopSseStream(): void {
        this.sseSubscription?.unsubscribe();
        this.sseSubscription = undefined;
        this.intervalSubscription?.unsubscribe();
        this.intervalSubscription = undefined;
    }

    /**
     * Returns network label.
     *
     * @param  {string} network - The network.
     *
     * @return string
     */
    getNetworkLabel(network: string): string {
        return NetworksTable[network];
    };

    /**
     * Gets data chart for the given network.
     *
     * @param  {string} network - The network.
     *
     * @return ChartData
     */
    getData(network: string): ChartData[] {
        if (this.chartData.find(d => d.network === network)) {
            return this.chartData.find(d => d.network === network)!.data;
        }
        return [];
    }

    /**
     * Extracts and adds post info.
     *
     * @param  {any} message - The post to process.
     */
    checkActivity(message: any) : void {
        let day: string;
        let hour: string;
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
     *
     * @return [string, string]
     */
    extractDayAndHour(timestamp: number): [string, string] {
        const date: Date = new Date(timestamp);
        return [DaysTable[date.getDay()], HoursTable[date.getHours()]];
    }

    /**
     * Increments activity count.
     *
     * @param  {string} network - The social network.
     * @param  {string} day - The day of post.
     * @param  {string} hour - The hour of post.
     */
    addActivity(network: string, day: string, hour: string): void {
        if (this.activities.find(activity => this.isActivitiesMatch(activity, network, day, hour))) {
            // Exclamation point because object is always defined in this case.
            const activity = this.activities.find(activity => this.isActivitiesMatch(activity, network, day, hour))!;
            const index = this.activities.findIndex(activity => this.isActivitiesMatch(activity, network, day, hour));
            const newValue: Activity = { network, day, hour, count: activity.count + 1 };
            this.activities.splice(index, 1, newValue);
        } else {
            this.activities = [...this.activities, { network, day, hour, count: 1 }];
        }
    }

    /**
     * Checks if activity match for the given period.
     *
     * @param  {Activity} activity - The activity.
     * @param  {string} network - The social network.
     * @param  {string} day - The day of post.
     * @param  {string} hour - The hour of post.
     *
     * @return boolean
     */
    isActivitiesMatch(activity: Activity, network: string, day: string, hour: string): boolean {
        return activity.network == network && activity.day == day && activity.hour == hour;
    }

    /**
     * Updates data for chart.
     */
    updateChartData(): void {
        let data: { network: string, data: ChartData[] }[] = [];
        this.networks.forEach(network => {
            const dataByNetwork: Activity[] = this.activities.filter(activity => activity.network === network);
            if (dataByNetwork.length) {
                let dataChartByNetwork: ChartData[] = [];
                HoursTable.forEach(hour => {
                    const dataByHour = dataByNetwork.filter(activity => activity.hour === hour);
                    let series: Series[] = [];
                    DaysTable.forEach(day => {
                        let count = 0;
                        if (dataByHour.find(activity => activity.day === day)) {
                            count = dataByHour.find(activity => activity.day === day)!.count;
                        }
                        series.push({name: day, value: count});
                    });
                    dataChartByNetwork.push({name: hour, series})
                });
                data.push({network, data: dataChartByNetwork});
            }
        });
        this.chartData = data;
    }

    /**
     * Returns total amount of activity for the given network.
     *
     * @param  {string} network - The social network.
     *
     * @return number
     */
    getCount(network: string): number {
        if (this.counter.find(c => c.network === network)) {
            return this.counter.find(c => c.network === network)!.count;
        }
        return 0;
    }

    /**
     * Updates activity counter.
     */
    updateCounter(): void {
        let newCounter: { network: string, count: number }[] = [];
        this.networks.forEach(network => {
            const dataByNetwork: Activity[] = this.activities.filter(activity => activity.network === network);
            let count: number = 0;
            dataByNetwork.forEach(activity => {
                count += activity.count;
            });
            newCounter.push({ network, count });
        });
        this.counter = newCounter;
    }
}
