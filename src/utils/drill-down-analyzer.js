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
    const dateTimeFields = [
        'year', 'quarter', 'month', 'week', 'date', 'day', 'time', 'period',
        'observationDateTime', 'createdAt', 'updatedAt', 'timestamp', 'dateCreated'
    ];
    const potentialHierarchyFields = [];
    
    // Step 2: For each field, check if it forms a hierarchy, exclude date/time and numeric strings
    for (const field of fields) {
        // Skip date/time fields
        if (dateTimeFields.some(keyword => field.toLowerCase().includes(keyword.toLowerCase()))) {
            console.log(`Excluding date/time field: ${field}`);
            continue;
        }
        // Skip fields with numeric string values
        if (isNumericStringField(dataset, field)) {
            console.log(`Excluding numeric string field: ${field}`);
            continue;
        }
        const uniqueValues = countUniqueValues(dataset, field);
        if (uniqueValues >= 2 && uniqueValues < dataset.length * 0.5) {
            potentialHierarchyFields.push({
                field: field,
                uniqueCount: uniqueValues
            });
        }
    }
    console.log('Potential hierarchy fields:', potentialHierarchyFields);
    
    // Step 3: Sort fields by uniqueness (fewer unique values suggest higher levels)
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
 * Check if a field contains numeric string values
 */
function isNumericStringField(dataset, field) {
    const sampleSize = Math.min(100, dataset.length);
    let numericStringCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
        const value = dataset[i][field];
        if (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
            numericStringCount++;
        }
    }
    
    // If >80% of sampled values are numeric strings, consider it a numeric string field
    return numericStringCount / sampleSize > 0.8;
}

/**
 * Identify up to 3 levels for drill-down visualization
 */
function identifyDrillDownLevels(dataset, hierarchyLevels, potentialHierarchyFields) {
    let dataFields = Object.keys(dataset[0]);
    
    // Define categories of fields that typically form hierarchies
    const knownFieldCategories = {
        geo: ['country', 'state', 'district', 'districtName', 'subdistrictName', 'subdistrict', 'tehsil', 
              'block', 'village', 'villageName', 'locality', 'city', 'town', 'region', 'zone'],
        time: ['year', 'quarter', 'month', 'week', 'date', 'day', 'time', 'period', 'observationDateTime'],
        org: ['department', 'division', 'unit', 'team', 'organization', 'sector', 'industry', 'category'],
        reservoir: ['riverBasin', 'river', 'reservoir', 'reservoirName', 'dam', 'waterBody', 'lake', 'pond', 
                   'fullReservoirLevel', 'minimumDrawDownLevel', 'currentLevel'],
        agriculture: ['crop', 'produce', 'variety', 'grade', 'productGrade', 'field', 'farm', 'plantation',
                     'warehouseName', 'warehouse', 'storage', 'silo', 'commodityVarietyName', 'agencyName']
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
    
    // Select field hierarchy based on domain knowledge, sorted by unique values
    let levelFields = [];
    
    // Helper function to sort fields by unique values
    const sortByUniqueValues = (fields) => {
        return fields.sort((a, b) => {
            const aUnique = potentialHierarchyFields.find(f => f.field === a)?.uniqueCount || Infinity;
            const bUnique = potentialHierarchyFields.find(f => f.field === b)?.uniqueCount || Infinity;
            return aUnique - bUnique;
        });
    };
    
    // Try to choose the best hierarchy based on domain, excluding time and numeric strings
    if (availableCategories.geo.length >= 2) {
        const validGeoFields = availableCategories.geo
            .filter(field => !isNumericStringField(dataset, field));
        levelFields = sortByUniqueValues(validGeoFields).slice(0, 3);
    } 
    else if (availableCategories.reservoir.length >= 2) {
        const validReservoirFields = availableCategories.reservoir
            .filter(field => !isNumericStringField(dataset, field));
        levelFields = sortByUniqueValues(validReservoirFields).slice(0, 3);
    }
    else if (availableCategories.agriculture.length >= 2) {
        const validAgriFields = availableCategories.agriculture
            .filter(field => !isNumericStringField(dataset, field));
        levelFields = sortByUniqueValues(validAgriFields).slice(0, 3);
    }
    // Otherwise use detected hierarchy levels, excluding time and numeric strings
    else {
        const uniqueFields = new Set();
        for (const level of hierarchyLevels) {
            if (!knownFieldCategories.time.some(keyword => 
                level.parent.toLowerCase().includes(keyword.toLowerCase()) ||
                level.child.toLowerCase().includes(keyword.toLowerCase())
            ) && !isNumericStringField(dataset, level.parent) && !isNumericStringField(dataset, level.child)) {
                uniqueFields.add(level.parent);
                uniqueFields.add(level.child);
                if (uniqueFields.size >= 3) break;
            }
        }
        levelFields = sortByUniqueValues(Array.from(uniqueFields)).slice(0, 3);
    }
    
    // If we still don't have enough levels, add more from potential hierarchy fields
    if (levelFields.length < 3) {
        for (const field of potentialHierarchyFields.map(f => f.field)) {
            if (!levelFields.includes(field) && 
                !knownFieldCategories.time.some(keyword => field.toLowerCase().includes(keyword.toLowerCase())) &&
                !isNumericStringField(dataset, field)) {
                levelFields.push(field);
            }
            if (levelFields.length >= 3) break;
        }
        // Re-sort to ensure ascending unique values
        levelFields = sortByUniqueValues(levelFields).slice(0, 3);
    }
    
    // Log selected levels with unique counts for debugging
    console.log('Selected drill-down levels:', levelFields.map(field => ({
        field,
        uniqueCount: countUniqueValues(dataset, field)
    })));
    
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
        agriculture: ['fineProduce', 'productGrade', 'grade', 'quality', 'yield', 'moistureLevel', 'foreignMatter', 
                     'modalPrice', 'minimumPrice', 'maximumPrice', 'arrivalQuantity'],
        reservoir: ['currentLevel', 'capacity', 'totalCapacity', 'storage', 'waterLevel', 'percentageFilled'],
        weather: ['temperature', 'rainfall', 'precipitation', 'humidity', 'airTemperature.maxOverTime', 
                 'airTemperature.minOverTime', 'relativeHumidity.maxOverTime', 'relativeHumidity.minOverTime'],
        financial: ['revenue', 'profit', 'sales', 'income']
    };
    
    // Check if we have weather-related fields
    const weatherFields = aggregatableFields.filter(field => 
        field.toLowerCase().includes('temperature') ||
        field.toLowerCase().includes('precipitation') ||
        field.toLowerCase().includes('humidity')
    );
    
    if (weatherFields.length > 0) {
        const bestField = weatherFields[0];
        return { 
            fieldName: bestField, 
            displayName: formatFieldName(bestField)
        };
    }
    
    // Try to find a metric according to domain priorities
    for (const domain in metricPriorities) {
        for (const metric of metricPriorities[domain]) {
            const exactMatch = aggregatableFields.find(field => field === metric);
            if (exactMatch) {
                return { 
                    fieldName: exactMatch, 
                    displayName: formatFieldName(exactMatch)
                };
            }
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
    
    // Default to first numerical field
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
    
    const excludeMetricFields = [
        'id', 'code', 'uuid', 'guid', 'objectid', 'key', 'observationDateTime',
        'createdAt', 'updatedAt', 'timestamp', 'dateCreated'
    ];
    
    const filteredMetrics = aggregatableFields.filter(field => 
        !excludeMetricFields.some(exclude => 
            field.toLowerCase().includes(exclude.toLowerCase()) ||
            field.toLowerCase().endsWith('id')
        )
    );
    
    const metricPriorities = {
        agriculture: ['fineProduce', 'productGrade', 'grade', 'quality', 'yield', 'moistureLevel', 'foreignMatter', 
                     'modalPrice', 'minimumPrice', 'maximumPrice', 'arrivalQuantity'],
        reservoir: ['currentLevel', 'capacity', 'totalCapacity', 'storage', 'waterLevel', 'percentageFilled'],
        weather: ['temperature', 'rainfall', 'precipitation', 'humidity', 'airTemperature.maxOverTime', 
                 'airTemperature.minOverTime', 'relativeHumidity.maxOverTime', 'relativeHumidity.minOverTime'],
        financial: ['revenue', 'profit', 'sales', 'income']
    };
    
    let metrics = [];
    
    const weatherFields = filteredMetrics.filter(field => 
        field.toLowerCase().includes('temperature') ||
        field.toLowerCase().includes('precipitation') ||
        field.toLowerCase().includes('humidity')
    );
    
    if (weatherFields.length > 0) {
        metrics.push({
            fieldName: weatherFields[0],
            displayName: formatFieldName(weatherFields[0]),
            priority: 'high'
        });
    }
    
    for (const domain in metricPriorities) {
        for (const metric of metricPriorities[domain]) {
            const exactMatch = filteredMetrics.find(field => field === metric);
            if (exactMatch && !metrics.some(m => m.fieldName === exactMatch)) {
                metrics.push({ 
                    fieldName: exactMatch, 
                    displayName: formatFieldName(exactMatch),
                    priority: 'high'
                });
            }
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
    
    for (const field of filteredMetrics) {
        if (!metrics.some(m => m.fieldName === field)) {
            metrics.push({
                fieldName: field,
                displayName: formatFieldName(field),
                priority: 'low'
            });
        }
    }
    
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
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
}

/**
 * Count unique values for a specific field
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
    const parentGroups = {};
    for (const item of dataset) {
        const parentValue = JSON.stringify(item[parentField]);
        if (!parentGroups[parentValue]) {
            parentGroups[parentValue] = new Set();
        }
        parentGroups[parentValue].add(JSON.stringify(item[childField]));
    }
    
    const totalUniqueChildren = countUniqueValues(dataset, childField);
    let validParents = 0;
    
    for (const parent in parentGroups) {
        const childCount = parentGroups[parent].size;
        if (childCount > 1 && childCount < totalUniqueChildren) {
            validParents++;
        }
    }
    
    return validParents >= 2;
}

/**
 * Check if a field contains numerical values
 */
function isNumerical(dataset, field) {
    const sampleSize = Math.min(100, dataset.length);
    let numericalCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
        const value = dataset[i][field];
        if (typeof value === 'number' && !isNaN(value)) {
            numericalCount++;
        }
    }
    
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