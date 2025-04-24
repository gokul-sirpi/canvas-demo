// AMC Commodity Price Information in Khammam District
// resource id: 9c24f067-9552-45c2-9137-512263651b79
const plotSchema1 = [
  {
    plotType: 'barChart',
    xAxis: ['commodityVarietyName'],
    yAxis: ['modalPrice'],
    aggregation: 'none',
    dynamic: ['amName', 'agencyName'],
  },

  {
    plotType_3: 'pieChart',
    xAxis: ['commodityVarietyName'],
    yAxis: ['arrivalQuantity'],
    aggregation: 'sum',
    dynamic: ['amcName', 'agencyName'],
  },
  {
    plotType_4: 'stackedBarChart',
    xAxis: ['commodityVarietyName'],
    yAxis: ['minimumPrice', 'modalPrice', 'maximumPrice'],
    aggregation: 'none',
    dynamic: ['amcName', 'agencyName'],
  },
];

// Chilli Sampling for Quality in Telangana State
// res id: bf3f8f28-5949-436f-acce-893c87494462
const plotSchema2 = [
  {
    plotType_1: 'stackedBarChart',
    xAxis: ['warehouseName'],
    yAxis: ['fineProduce', 'brokenProduce', 'foreignMatter'],
    aggregation: 'none',
    dynamic: ['districtName', 'productGrade'],
  },

  {
    plotType_1: 'radarChart',
    xAxis: ['foreignMatter', 'pows', 'brokenProduce', 'mip', 'ddp'],
    yAxis: [],
    dynamic: ['warehouseName', 'sampleID', 'districtName', 'productGrade'],
  },
];

// AMC Commodity Price Information in Telangana State
// res id: 4aef701f-bf08-4f66-b38b-594a9c8c15cf
const plotSchema3 = [
  {
    plotType_2: 'scatterPlot',
    xAxis: ['arrivalQuantity'],
    yAxis: ['modalPrice'],
    dynamic: ['commodityVarietyName', 'marketName', 'amcName'],
  },

  {
    plotType_3: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: ['modalPrice', 'arrivalQuantity'],
    dynamic: ['commodityVarietyName', 'marketName', 'amcName'],
  },
  {
    plotType_6: 'stackedBarChart',
    xAxis: ['commodityVarietyName'],
    yAxis: ['minimumPrice', 'modalPrice', 'maximumPrice'],
    aggregation: 'none',
    dynamic: ['marketName', 'arrivalQuantity'],
  },
  {
    plotType_3: 'barChart',
    xAxis: ['commodityVarietyName'],
    yAxis: ['arrivalQuantity'],
    aggregation: 'none',
    dynamic: ['amcName', 'agencyName'],
  },
  {
    plotType_4: 'scatterPlot',
    xAxis: ['minimumPrice'],
    yAxis: ['maximumPrice'],
    dynamic: ['commodityVarietyName', 'amcName'],
  },
];

// NPDCL Agriculture Consumption Data in Telangana
// res id: 41bb4389-ebaf-4df7-a575-556ec6092a25
const plotSchema4 = [
  {
    plotType_1: 'stackedBarChart',
    xAxis: ['cityName'],
    yAxis: ['powerConsumption', 'totalServiceCount'],
    aggregation: 'none',
    dynamic: ['category', 'observationDateTime'],
  },
  {
    plotType_2: 'scatterPlot',
    xAxis: ['totalServiceCount'],
    yAxis: ['powerConsumption'],
    dynamic: ['cityName', 'category'],
  },
  {
    plotType_4: 'stackedBarChart',
    xAxis: ['cityName'],
    yAxis: ['powerConsumption', 'totalServiceCount'],
    aggregation: 'none',
    dynamic: ['cityName'],
  },
];

// Weather Information in Khammam District =>not yet
// res id: b72a23b8-5767-48a1-8fc8-6abafe23e69a
const plotSchema5 = [
  {
    plotType_1: 'stackedBarChart',
    xAxis: ['subdistrictName'],
    yAxis: ['airTemperature.maxOverTime', 'airTemperature.minOverTime'],
    aggregation: 'none',
    dynamic: [],
  },
  {
    plotType_2: 'stackedBarChart',
    xAxis: ['subdistrictName'],
    yAxis: ['relativeHumidity.maxOverTime', 'relativeHumidity.minOverTime'],
    aggregation: 'none',

    dynamic: [],
  },
  {
    plotType_3: 'radarChart',
    xAxis: ['maxTemperature', 'minTemperature', 'maxHumidity', 'minHumidity'],
    yAxis: [],
    dynamic: ['subdistrictName'],
  },
  {
    plotType_4: 'stackedBarChart',
    xAxis: ['subdistrictName'],
    yAxis: [
      'airTemperature.maxOverTime',
      'airTemperature.minOverTime',
      'relativeHumidity.maxOverTime',
      'relativeHumidity.minOverTime',
    ],
    aggregation: 'none',

    dynamic: ['subdistrictName'],
  },
];

// Subdistrict Level Weather Information from Telangana [Add dynamic]
// res id:41bb4389-ebaf-4df7-a575-556ec6092a25
const plotSchema6 = [
  {
    plotType_2: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: ['airTemperature.maxOverTime', 'airTemperature.minOverTime'],
    dynamic: ['districtName', 'subdistrictName'],
  },
  {
    plotType_3: 'barChart',
    xAxis: ['observationDateTime'],
    yAxis: ['precipitation'],
    aggregation: 'none',
    dynamic: ['districtName', 'subdistrictName'],
  },
  {
    plotType_4: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: ['windSpeed.maxOverTime', 'windSpeed.minOverTime'],
    dynamic: ['districtName', 'subdistrictName'],
  },

  {
    plotType_5: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: ['relativeHumidity.maxOverTime', 'relativeHumidity.minOverTime'],
    dynamic: ['districtName', 'subdistrictName'],
  },
];

// SPDCL Agriculture Consumption Data in Telangana [add dynamic ]
// res id:41bb4389-ebaf-4df7-a575-556ec6092a25
const plotSchema7 = [
  {
    plotType_1: 'stackedBarChart',
    xAxis: ['areaServed'],
    yAxis: ['energyConsumption', 'powerConsumption', 'totalServiceCount'],
    dynamic: [areaServed],
  },

  {
    plotType_2: 'scatterPlot',
    xAxis: ['energyConsumption'],
    yAxis: ['powerConsumption'],
    dynamic: ['areaServed'],
  },

  {
    plotType_4: 'stackedBarChart',
    xAxis: ['areaServed'],
    yAxis: [
      'energyConsumption',
      'powerConsumption',
      'totalServiceCount',
      'billedServicesCount',
    ],
    aggregation: 'none',
    dynamic: ['areaServed'],
  },
];

// Niruthi Weather Information for Telangana
// res id: d60e022f-e32a-4d66-8178-0e7d91361c95
const plotSchema8 = [
  {
    plotType_1: 'stackedBarChart',
    xAxis: ['villageName'],
    yAxis: [
      'windSpeed.avgOverTime',
      'windSpeed.maxOverTime',
      'precipitation',
      'solarRadiation',
      'airTemperature.maxOverTime',
      'airTemperature.minOverTime',
      'relativeHumidity.avgOverTime',
    ],
    aggregation: 'none',
    dynamic: ['subdistrictName', 'observationDateTime'],
  },

  {
    plotType_3: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: [
      'airTemperature.maxOverTime',
      'airTemperature.minOverTime',
      'relativeHumidity.avgOverTime',
    ],
    dynamic: ['villageName', 'subdistrictName'],
  },
  {
    plotType_5: 'radarChart',
    xAxis: [
      'windSpeed.avgOverTime',
      'windSpeed.maxOverTime',
      'relativeHumidity.avgOverTime',
      'relativeHumidity.maxOverTime',
      'relativeHumidity.minOverTime',
      'solarRadiation',
      'dewPoint',
      'airTemperature.maxOverTime',
      'airTemperature.minOverTime',
    ],
    yAxis: [],
    dynamic: ['villageName', 'observationDateTime'],
  },
  {
    plotType_1: 'bubblePlot',
    xAxis: ['airTemperature.maxOverTime'],
    yAxis: ['relativeHumidity.avgOverTime'],
    dynamic: ['precipitation', 'villageName'],
  },
  {
    plotType_1: 'scatterPlot',
    xAxis: ['airTemperature.maxOverTime'],
    yAxis: ['precipitation'],
    dynamic: ['windSpeed.avgOverTime', 'villageName'],
  },
  {
    plotType_1: 'scatterPlot',
    xAxis: ['subdistrictName'],
    yAxis: ['airTemperature.maxOverTime'],
    dynamic: ['subdistrictName', 'villageName'],
  },
];

// // Historical Rainfall Information in Khammam District
// // res id:41bb4389-ebaf-4df7-a575-556ec6092a25
const plotSchema9 = [
  {
    plotType_6: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: ['precipitation'],
    dynamic: ['subdistrictName', 'districtCode'],
  },

  {
    plotType_7: 'barChart',
    xAxis: ['subdistrictName'],
    yAxis: ['precipitation'],
    aggregation: 'none',
    dynamic: ['observationDateTime', 'districtCode'],
  },

  {
    plotType_9: 'scatterPlot',
    xAxis: 'precipitation',
    yAxis: 'airTemperature.maxOverTime',
    dynamic: ['subdistrictName', 'observationDateTime'],
  },
];

// "Reservoir Water Storage in Telangana State"
// res id: 0e5294b8-8eb8-4ee5-9309-95fe5a426e76"
const plotSchema10 = [
  {
    plotType_1: 'barChart',
    xAxis: ['reservoirID', 'reservoirName'],
    yAxis: ['currentCapacity', 'totalCapacity'],
    dynamic: ['riverBasin', 'observationDateTime'],
  },

  {
    plotType_2: 'lineChart',
    xAxis: ['observationDateTime'],
    yAxis: ['currentCapacity'],
    dynamic: ['reservoirName'],
  },

  {
    plotType_5: 'scatterPlot',
    xAxis: ['currentCapacity'],
    yAxis: ['outflow'],
    dynamic: ['reservoirID', 'reservoirName'],
  },

  {
    plotType_6: 'stackedAreaChart',
    xAxis: ['observationDateTime'],
    yAxis: ['inflow', 'outflow'],
    dynamic: ['reservoirName'],
  },

  {
    plotType_7: 'radarChart',
    xAxis: ['metricType'],
    yAxis: ['metricValue'],
    dynamic: ['reservoirName'],
  },
];

{
  // "Chilli Sampling for Quality in Telangana State"
  [
    {
      plotType_1: 'largeScaleBarChart',
      isDrillDownAvailable: true,
      level_1: {
        xAxis: ['districtNames'],
        yAxis: ['number of samples associated with each district'],
        dynamic: ['districtName'],
      },
      level_2: {
        xAxis: ['subdistrictName'],
        yAxis: ['number of samples associated with each subdistrict'],
        dynamic: ['subdistrictName'],
      },
      level_3: {
        xAxis: ['villageName'],
        yAxis: ['fineProduce'],
        dynamic: ['villageName'],
      },
    },
  ];
}
