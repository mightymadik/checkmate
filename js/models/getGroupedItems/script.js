 async function getGroupedItemsByObjectName(listUrl, fieldsUrl, objectFieldKey) {
    const [allItems, fieldMaps] = await Promise.all([
        fetchAllItems(listUrl),
        fetchFieldValues(fieldsUrl, [objectFieldKey])
    ]);

    const idToNameMap = fieldMaps[objectFieldKey] || {};
    const groupedItems = {};

    allItems.forEach(item => {
        const objectId = item[objectFieldKey];
        const objectName = idToNameMap[objectId] || 'Неизвестно';

        if (!groupedItems[objectName]) {
            groupedItems[objectName] = [];
        }
        groupedItems[objectName].push(item);
    });

    return groupedItems;
}