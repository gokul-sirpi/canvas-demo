export type plotResource = {
    id: string
    name: string
    description: string
    accessPolicy: string
    apdURL: string
    dataDescriptor: dataDescriptor
    plotSchema: plotSchema[]
    label: string
    resourceGroup: string
};

export type plotSchema = {
    dynamic: string[]
    xAxis: string[]
    yAxis: string[]

};

export type dataDescriptor = {
    key: {
        [key: string]: string
    }
}