import { Component, OnInit } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { SseService } from './services/sse.service';
import { Activity, ChartData, DaysTable, HoursTable, NetworksTable, Series } from './models';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    sseSubscription: Subscription | undefined;
    networks: string[] = Object.keys(NetworksTable);
    data: { network: string, data: ChartData[] }[] = [];
    buffer: Activity[] = [];

    constructor(private sseService: SseService) { }

    /**
     * Starts SSE stream on component initiation and stops it on dirty destroyed page.
     */
    ngOnInit(): void {
        this.initChartsData();
        this.startSseStream();
        window.onbeforeunload = () => this.stopSseStream();
        interval(5000).subscribe(_ => {
            if (this.sseSubscription) {
                this.updateChartData();
            }
        });
    }

    /**
     * Inits charts data.
     */
    initChartsData(): void {
        let series: Series[] = [];
        DaysTable.forEach(day => {
            series.push({ name: day, value: 0 });
        });
        let chartData: ChartData[] = [];
        HoursTable.forEach(hour => {
            chartData.push({ name: hour, series });
        });
        Object.keys(NetworksTable).forEach(network => {
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
        return this.data.find(d => d.network === network)!.data;
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
        if (this.buffer.find(activity => this.isActivitiesMatch(activity, network, day, hour))) {
            // Exclamation point because object is always defined in this case.
            const activity = this.buffer.find(activity => this.isActivitiesMatch(activity, network, day, hour))!;
            const index = this.buffer.findIndex(activity => this.isActivitiesMatch(activity, network, day, hour));
            const newValue: Activity = { network, day, hour, count: activity.count + 1 };
            this.buffer.splice(index, 1, newValue);
        } else {
            this.buffer = [...this.buffer, { network, day, hour, count: 1 }];
        }
        console.log(this.buffer);
    }

    /**
     * Checks if activity match for the given period.
     *
     * @param  {Activity} activity - The activity.
     * @param  {string} network - The social network.
     * @param  {string} day - The day of post.
     * @param  {string} hour - The hour of post.
     * @return boolean
     */
    isActivitiesMatch(activity: Activity, network: string, day: string, hour: string): boolean {
        return activity.network == network && activity.day == day && activity.hour == hour;
    }

    /**
     * Updates data for chart.
     */
    updateChartData(): void {
        this.buffer.forEach(activity => {
            const dataByNetwork = this.data.find(d => d.network === activity.network)!.data;
            const dataByHour = dataByNetwork.find(d => d.name === activity.hour)!.series;
            const dataByDay = dataByHour.find(d => d.name === activity.day)!.value;
            this.data.forEach(n => {
                if(n.network === activity.network) {
                    n.data.forEach(h => {
                        if(h.name === activity.hour) {
                            h.series.forEach(d => {
                                if(d.name === activity.day) {
                                    d.value = dataByDay + activity.count;
                                }
                            })
                        }
                    })
                }
            });
        })
        console.log(this.data[0]);
    }
}
