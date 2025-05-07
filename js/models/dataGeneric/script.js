async function getCombinedDataGeneric(config) {
    const groupedItems = await getGroupedItemsByObjectName(config.listUrl, config.fieldsUrl, config.objectKey);
    const floorsByObject = await getFloorsAndSections(config.listUrl, config.fieldsUrl, config);

    const combinedData = {};

    for (const objectName in groupedItems) {
        combinedData[objectName] = {
            items: groupedItems[objectName],
            floors: floorsByObject[objectName] || {},
        };
    }

    return combinedData;
}