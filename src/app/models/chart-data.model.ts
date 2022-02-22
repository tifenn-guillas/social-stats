/**
 * Interface for chart data by network.
 *
 * @interface ChartData
 */
export interface ChartDataByNetwork {
    network: string,
    data: ChartData[]
}

/**
 * Interface for chart data.
 *
 * @interface ChartData
 */
export interface ChartData {
    name: string,
    series: Series[]
}

/**
 * Interface for chart data series.
 *
 * @interface Series
 */
export interface Series {
    name: string,
    value: number
}
