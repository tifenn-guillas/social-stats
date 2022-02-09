import { Component, Input } from '@angular/core';

import { ScaleType } from '@swimlane/ngx-charts';

import { ChartData } from '../models';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent {
    @Input() data: ChartData[] = [];

    colorScheme = {
        name: 'colorScheme',
        selectable: true,
        group: ScaleType.Ordinal,
        domain: ['#F1F5F9', '#C2185B']
    };
    view: [number, number] = [700, 300];
    xAxis: boolean = true;
    yAxis: boolean = true;
    showLegend: boolean = true;
    tooltipDisabled: boolean = false;
}
