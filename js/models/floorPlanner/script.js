async function getFloorsAndSections(listUrl, fieldsUrl, config) {
    const [allItems, fieldMaps] = await Promise.all([
        fetchAllItems(listUrl),
        fetchFieldValues(fieldsUrl, [config.floorKey, config.objectKey])
    ]);

    const floorMap = fieldMaps[config.floorKey];
    const objectMap = fieldMaps[config.objectKey];
    const result = {};

    allItems.forEach(item => {
        const floorId = item[config.floorKey];
        const objectId = item[config.objectKey];
        const section = item[config.sectionKey];
        const objectName = objectMap?.[objectId] || 'Неизвестно';
        const floorName = floorMap?.[floorId];

        if (!floorId || !section || !objectId || !floorName) return;

        if (!result[objectName]) result[objectName] = {};
        if (!result[objectName][floorName]) result[objectName][floorName] = {};

        // базовая или расширенная информация
        if (config.card) {
            result[objectName][floorName][section] = {
                id: item.id,
                title: item[config.titleKey],
                pricePerM2: item[config.priceM2Key],
                totalPrice: item[config.totalPriceKey],
                img: item[config.img],
                classObject: item[config.classObject],
                freeObject: item[config.freeObject],
            };
        } else if (config.checkmatePlus) {
            result[objectName][floorName][section] = {
                id: item.id,
                title: item[config.titleKey],
                pricePerM2: item[config.priceM2Key],
                img: item[config.img],
                totalPrice: item[config.totalPriceKey],
                classObject: item[config.classObject],
                freeObject: item[config.freeObject],
            };
        } else if (config.checkmate) {
            result[objectName][floorName][section] = {
                id: item.id,
                title: item[config.titleKey],
                img: item[config.img],
                freeObject: item[config.freeObject],
                pricePerM2: item[config.priceM2Key],
                totalPrice: item[config.totalPriceKey],
            };
        }        

    });

    console.log(result)
    return result;
}