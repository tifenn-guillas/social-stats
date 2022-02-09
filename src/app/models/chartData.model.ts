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
