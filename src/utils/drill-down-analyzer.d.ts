export function canDrillDown(dataset: any[]): {
    drillDownPossible: boolean;
    reason?: string;
    hierarchyLevels?: any[];
    drillDownLevels?: any[];
    bestMetric?: any;
    bestMetrics?: any[];
    aggregatableFields?: string[];
    potentialFields?: any[];
  };
  
  export function analyzeDatasetDrillDown(dataset: any[]): {
    dd: boolean;
    details: {
      drillDownPossible: boolean;
      reason?: string;
      hierarchyLevels?: any[];
      drillDownLevels?: any[];
      bestMetric?: any;
      bestMetrics?: any[];
      aggregatableFields?: string[];
      potentialFields?: any[];
    };
  };