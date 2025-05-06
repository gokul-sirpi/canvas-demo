/**
 * Dataset Drill-Down Analyzer
 * This script analyzes datasets to determine if they support drill-down functionality.
 */

/**
 * Main function to determine if a dataset supports drill-down
 * @param {Array} dataset - The dataset to analyze
 * @returns {Object} Analysis results with drill-down possibility and details
 */
function canDrillDown(dataset) {
    if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
        return {
            drillDownPossible: false,
            reason: "Invalid or empty dataset"
        };
    }

    // Step 1: Identify potential hierarchy fields
    const fields = extractFields(dataset[0]);
    const potentialHierarchyFields = [];
    
    // Step 2: For each field, check if it forms a hierarchy
    for (const field of fields) {
        // Count unique values for this field
        const uniqueValues = countUniqueValues(dataset, field);
        
        // If number of unique values is between 2 and significantly less than dataset size
        if (uniqueValues >= 2 && uniqueValues < dataset.length * 0.5) {
            potentialHierarchyFields.push({
                field: field,
                uniqueCount: uniqueValues
            });
        }
    }
    
    // Step 3: Sort fields by uniqueness (fewer unique values suggest higher levels in hierarchy)
    potentialHierarchyFields.sort((a, b) => a.uniqueCount - b.uniqueCount);
    
    // Step 4: Check for at least two hierarchy levels
    if (potentialHierarchyFields.length < 2) {
        return {
            drillDownPossible: false,
            reason: "Insufficient hierarchy levels detected",
            potentialFields: potentialHierarchyFields
        };
    }
    
    // Step 5: Verify parent-child relationships between fields
    const hierarchyLevels = [];
    for (let i = 0; i < potentialHierarchyFields.length - 1; i++) {
        const parentField = potentialHierarchyFields[i].field;
        const childField = potentialHierarchyFields[i + 1].field;
        
        if (verifyParentChildRelationship(dataset, parentField, childField)) {
            hierarchyLevels.push({
                parent: parentField,
                child: childField
            });
        }
    }
    
    // Step 6: Check if we found at least one valid parent-child relationship
    if (hierarchyLevels.length === 0) {
        return {
            drillDownPossible: false,
            reason: "No valid parent-child relationships detected",
            potentialFields: potentialHierarchyFields
        };
    }
    
    // Step 7: Check for numerical fields that can be aggregated
    const aggregatableFields = fields.filter(field => 
        isNumerical(dataset, field)
    );
    
    if (aggregatableFields.length === 0) {
        return {
            drillDownPossible: false,
            reason: "No aggregatable numerical fields found",
            hierarchyLevels: hierarchyLevels
        };
    }
    
    // Step 8: Identify the drill-down levels and best metric
    const drillDownLevels = identifyDrillDownLevels(dataset, hierarchyLevels, potentialHierarchyFields);
    const bestMetric = selectSingleBestMetric(dataset, aggregatableFields);
    const bestMetrics = identifyBestMetrics(dataset, aggregatableFields);
    
    // Step 9: Return positive result with detected hierarchy
    return {
        drillDownPossible: true,
        hierarchyLevels: hierarchyLevels,
        drillDownLevels: drillDownLevels,
        bestMetric: bestMetric,
        bestMetrics: bestMetrics,
        aggregatableFields: aggregatableFields
    };
}

/**
 * Identify up to 3 levels for drill-down visualization
 */
function identifyDrillDownLevels(dataset, hierarchyLevels, potentialHierarchyFields) {
    let dataFields = Object.keys(dataset[0]);
    
    // Define categories of fields that typically form hierarchies
    const knownFieldCategories = {
        // Geographic fields
        geo: ['country', 'state', 'district', 'districtName', 'subdistrictName', 'subdistrict', 'tehsil', 
              'block', 'village', 'villageName', 'locality', 'city', 'town', 'region', 'zone'],
        // Time fields
        time: ['year', 'quarter', 'month', 'week', 'date', 'day', 'time', 'period', 'observationDateTime'],
        // Organization fields
        org: ['department', 'division', 'unit', 'team', 'organization', 'sector', 'industry', 'category'],
        // Water/Reservoir fields
        reservoir: ['riverBasin', 'river', 'reservoir', 'reservoirName', 'dam', 'waterBody', 'lake', 'pond', 
                   'fullReservoirLevel', 'minimumDrawDownLevel', 'currentLevel'],
        // Agricultural fields
        agriculture: ['crop', 'produce', 'variety', 'grade', 'productGrade', 'field', 'farm', 'plantation',
                     'warehouseName', 'warehouse', 'storage', 'silo']
    };
    
    // Identify available categories in the dataset
    const availableCategories = {};
    for (const category in knownFieldCategories) {
        availableCategories[category] = dataFields.filter(field => 
            knownFieldCategories[category].some(keyword => 
                field.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }
    
    // Select field hierarchy based on domain knowledge
    let levelFields = [];
    
    // Try to choose the best hierarchy based on domain
    if (availableCategories.geo.length >= 3) {
        // Geographic hierarchy (country > state > district > subdistrict > village)
        const geoHierarchy = [
            'country', 'state', 'district', 'districtName', 'subdistrictName', 'subdistrict', 
            'tehsil', 'block', 'village', 'villageName', 'locality'
        ];
        
        // Sort fields by their position in the geoHierarchy array
        const sortedGeoFields = availableCategories.geo.sort((a, b) => {
            const aIndex = geoHierarchy.findIndex(term => a.toLowerCase().includes(term.toLowerCase()));
            const bIndex = geoHierarchy.findIndex(term => b.toLowerCase().includes(term.toLowerCase()));
            return aIndex - bIndex;
        });
        
        levelFields = sortedGeoFields.slice(0, 3);
    } 
    else if (availableCategories.reservoir.length >= 3) {
        // Reservoir hierarchy
        const reservoirHierarchy = [
            'riverBasin', 'river', 'reservoir', 'reservoirName', 'dam', 'waterBody'
        ];
        
        const sortedReservoirFields = availableCategories.reservoir.sort((a, b) => {
            const aIndex = reservoirHierarchy.findIndex(term => a.toLowerCase().includes(term.toLowerCase()));
            const bIndex = reservoirHierarchy.findIndex(term => b.toLowerCase().includes(term.toLowerCase()));
            return aIndex - bIndex;
        });
        
        levelFields = sortedReservoirFields.slice(0, 3);
    }
    else if (availableCategories.agriculture.length >= 3) {
        // Agricultural hierarchy
        const agriHierarchy = [
            'warehouseName', 'warehouse', 'storage', 'productGrade', 'grade'
        ];
        
        const sortedAgriFields = availableCategories.agriculture.sort((a, b) => {
            const aIndex = agriHierarchy.findIndex(term => a.toLowerCase().includes(term.toLowerCase()));
            const bIndex = agriHierarchy.findIndex(term => b.toLowerCase().includes(term.toLowerCase()));
            return aIndex - bIndex;
        });
        
        levelFields = sortedAgriFields.slice(0, 3);
    }
    // Otherwise use detected hierarchy levels
    else {
        // Extract unique fields from hierarchyLevels
        const uniqueFields = new Set();
        
        for (const level of hierarchyLevels) {
            uniqueFields.add(level.parent);
            uniqueFields.add(level.child);
            if (uniqueFields.size >= 3) break;
        }
        
        levelFields = Array.from(uniqueFields).slice(0, 3);
    }
    
    // If we still don't have enough levels, add more from potential hierarchy fields
    if (levelFields.length < 3) {
        for (const field of potentialHierarchyFields.map(f => f.field)) {
            if (!levelFields.includes(field)) {
                levelFields.push(field);
            }
            if (levelFields.length >= 3) break;
        }
    }
    
    // Format the levels for display
    return levelFields.slice(0, 3).map((field, index) => {
        return {
            CONDITION: index + 1,
            fieldName: field,
            displayName: formatFieldName(field),
            uniqueValues: countUniqueValues(dataset, field)
        };
    });
}

/**
 * Select a single best metric from available aggregatable fields
 */
function selectSingleBestMetric(dataset, aggregatableFields) {
    if (!aggregatableFields || aggregatableFields.length === 0) {
        return { fieldName: "count", displayName: "Count" };
    }
    
    // Define priority metrics for different domains
    const metricPriorities = {
        // Agricultural metrics
        agriculture: ['fineProduce', 'productGrade', 'grade', 'quality', 'yield', 'moistureLevel', 'foreignMatter'],
        // Water/reservoir metrics
        reservoir: ['currentLevel', 'capacity', 'totalCapacity', 'storage', 'waterLevel', 'percentageFilled'],
        // Weather metrics
        weather: ['temperature', 'rainfall', 'precipitation', 'humidity'],
        // Financial metrics
        financial: ['revenue', 'profit', 'sales', 'income']
    };
    
    // Check if we have quality-related fields for agriculture
    const agriQualityFields = aggregatableFields.filter(field => 
        field.toLowerCase().includes('quality') ||
        field.toLowerCase().includes('grade') ||
        field.toLowerCase().includes('fine') ||
        field.toLowerCase().includes('produce')
    );
    
    if (agriQualityFields.length > 0) {
        const bestField = agriQualityFields[0];
        return { 
            fieldName: bestField, 
            displayName: formatFieldName(bestField)
        };
    }
    
    // Try to find a metric according to domain priorities
    for (const domain in metricPriorities) {
        for (const metric of metricPriorities[domain]) {
            // Look for exact match first
            const exactMatch = aggregatableFields.find(field => field === metric);
            if (exactMatch) {
                return { 
                    fieldName: exactMatch, 
                    displayName: formatFieldName(exactMatch)
                };
            }
            
            // Then try to find fields containing the metric name
            const partialMatch = aggregatableFields.find(field => 
                field.toLowerCase().includes(metric.toLowerCase())
            );
            if (partialMatch) {
                return { 
                    fieldName: partialMatch, 
                    displayName: formatFieldName(partialMatch)
                };
            }
        }
    }
    
    // If no specific metric found, return the first available numeric field
    const defaultMetric = aggregatableFields[0];
    return { 
        fieldName: defaultMetric, 
        displayName: formatFieldName(defaultMetric)
    };
}

/**
 * Identify suitable metrics for the dataset
 */
function identifyBestMetrics(dataset, aggregatableFields) {
    if (!aggregatableFields || aggregatableFields.length === 0) {
        return [{ fieldName: "count", displayName: "Count" }];
    }
    
    // Fields to exclude from metrics
    const excludeMetricFields = [
        'id', 'code', 'uuid', 'guid', 'objectid', 'key', 'observationDateTime',
        'createdAt', 'updatedAt', 'timestamp', 'dateCreated'
    ];
    
    // Filter out technical fields from metrics
    const filteredMetrics = aggregatableFields.filter(field => 
        !excludeMetricFields.some(exclude => 
            field.toLowerCase().includes(exclude.toLowerCase()) ||
            field.toLowerCase().endsWith('id')
        )
    );
    
    // Define priority metrics for different domains
    const metricPriorities = {
        // Agricultural metrics
        agriculture: ['fineProduce', 'productGrade', 'grade', 'quality', 'yield', 'moistureLevel', 'foreignMatter'],
        // Water/reservoir metrics
        reservoir: ['currentLevel', 'capacity', 'totalCapacity', 'storage', 'waterLevel', 'percentageFilled'],
        // Weather metrics
        weather: ['temperature', 'rainfall', 'precipitation', 'humidity'],
        // Financial metrics
        financial: ['revenue', 'profit', 'sales', 'income']
    };
    
    // Top candidates to return
    let metrics = [];
    
    // Check if we have quality-related fields for agriculture
    const agriQualityFields = filteredMetrics.filter(field => 
        field.toLowerCase().includes('quality') ||
        field.toLowerCase().includes('grade') ||
        field.toLowerCase().includes('fine') ||
        field.toLowerCase().includes('produce')
    );
    
    if (agriQualityFields.length > 0) {
        metrics.push({
            fieldName: agriQualityFields[0],
            displayName: formatFieldName(agriQualityFields[0]),
            priority: 'high'
        });
    }
    
    // Try to find a metric according to domain priorities
    for (const domain in metricPriorities) {
        for (const metric of metricPriorities[domain]) {
            // Look for exact match first
            const exactMatch = filteredMetrics.find(field => field === metric);
            if (exactMatch && !metrics.some(m => m.fieldName === exactMatch)) {
                metrics.push({ 
                    fieldName: exactMatch, 
                    displayName: formatFieldName(exactMatch),
                    priority: 'high'
                });
            }
            
            // Then try to find fields containing the metric name
            const partialMatch = filteredMetrics.find(field => 
                field.toLowerCase().includes(metric.toLowerCase())
            );
            if (partialMatch && !metrics.some(m => m.fieldName === partialMatch)) {
                metrics.push({ 
                    fieldName: partialMatch, 
                    displayName: formatFieldName(partialMatch),
                    priority: 'medium'
                });
            }
        }
    }
    
    // Add remaining aggregatable fields with lower priority
    for (const field of filteredMetrics) {
        if (!metrics.some(m => m.fieldName === field)) {
            metrics.push({
                fieldName: field,
                displayName: formatFieldName(field),
                priority: 'low'
            });
        }
    }
    
    // Return all metrics, with the highest priority ones first
    return metrics.sort((a, b) => {
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Format a camelCase or snake_case field name to Title Case
 */
function formatFieldName(field) {
    return field
        // Split by camelCase
        .replace(/([A-Z])/g, ' $1')
        // Split by snake_case
        .replace(/_/g, ' ')
        // Capitalize first letter of each word
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
}

/**
 * Count unique values for a specific field in the dataset
 */
function countUniqueValues(dataset, field) {
    const uniqueValues = new Set();
    for (const item of dataset) {
        if (item[field] !== undefined && item[field] !== null) {
            uniqueValues.add(JSON.stringify(item[field]));
        }
    }
    return uniqueValues.size;
}

/**
 * Verify if two fields form a parent-child relationship
 */
function verifyParentChildRelationship(dataset, parentField, childField) {
    // Group by parent value
    const parentGroups = {};
    for (const item of dataset) {
        const parentValue = JSON.stringify(item[parentField]);
        if (!parentGroups[parentValue]) {
            parentGroups[parentValue] = new Set();
        }
        parentGroups[parentValue].add(JSON.stringify(item[childField]));
    }
    
    // Check if child values are reasonably distributed among parent values
    const totalUniqueChildren = countUniqueValues(dataset, childField);
    let validParents = 0;
    
    for (const parent in parentGroups) {
        const childCount = parentGroups[parent].size;
        if (childCount > 1 && childCount < totalUniqueChildren) {
            validParents++;
        }
    }
    
    // Return true if we found reasonable parent-child relationships
    return validParents >= 2;
}

/**
 * Check if a field contains numerical values
 */
function isNumerical(dataset, field) {
    // Check a sample of values to determine if the field is numerical
    const sampleSize = Math.min(100, dataset.length);
    let numericalCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
        const value = dataset[i][field];
        if (typeof value === 'number' && !isNaN(value)) {
            numericalCount++;
        }
    }
    
    // If >80% of sampled values are numerical, consider it a numerical field
    return numericalCount / sampleSize > 0.8;
}

/**
 * Extract fields from a sample item
 */
function extractFields(sampleItem) {
    return Object.keys(sampleItem);
}

/**
 * Analyze a dataset and set a dd flag indicating drill-down capability
 */
function analyzeDatasetDrillDown(dataset) {
    const result = canDrillDown(dataset);
    return {
        dd: result.drillDownPossible,
        details: result
    };
}

// Export functions for ES modules
export {
    canDrillDown,
    analyzeDatasetDrillDown
};