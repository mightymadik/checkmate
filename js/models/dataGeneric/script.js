async function getCombinedDataGeneric(config) {
    const groupedItems = await getGroupedItemsByObjectName(config.listUrl, config.fieldsUrl, config.objectKey);
    const floorsByObject = await getFloorsAndSections(config.listUrl, config.fieldsUrl, config);

    const combinedData = {};

    // Проверим, что данные действительно есть для каждого objectName
    for (const objectName in groupedItems) {
        combinedData[objectName] = {
            floors: floorsByObject[objectName] || {},
        };
    }

    return combinedData;
}