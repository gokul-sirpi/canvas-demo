export type plotResource = {
    id: string
    name: string
    description: string
    accessPolicy: 'SECURE' | 'OPEN' | 'PII'
    apdURL: string
    dataDescriptor: dataDescriptor
    plotSchema: plotSchema[]
    label: string
    resourceGroup: string
    resourceServer: string
    uniqueResourceId: string
    resourceType: 'MESSAGESTREAM' | 'DATASET'
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