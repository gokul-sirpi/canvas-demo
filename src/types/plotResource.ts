export type plotResource = {
    id: string
    name: string
    description: string
    accessPolicy: string
    apdURL: string
    dataDescriptor: object
    plotSchema: plotSchema[]
    label: string
};

export type plotSchema = {
    dynamic: string[]
    plotType: string
    xAxis: string[]
    yAxis: string[]
}