async function getFloorsAndSections(listUrl, fieldsUrl, config) {
    const [allItems, fieldMaps] = await Promise.all([
        fetchAllItems(listUrl),
        fetchFieldValues(fieldsUrl, [config.floorKey, config.objectKey, config.classObject, config.features])
    ]);

    const floorMap = fieldMaps[config.floorKey];
    const objectMap = fieldMaps[config.objectKey];
    const classMap = fieldMaps[config.classObject];
    const featuresMap = fieldMaps[config.features];

    const result = {};

    allItems.forEach(item => {
        const floorId = item[config.floorKey];
        const objectId = item[config.objectKey];
        const section = item[config.sectionKey];
        const classValue = classMap?.[item[config.classObject]] || '';
        const featuresValues = Array.isArray(item[config.features])
            ? item[config.features].map(f => featuresMap?.[f] || f)
            : [];

        const objectName = objectMap?.[objectId] || 'Неизвестно';
        const floorName = floorMap?.[floorId];

        if (!floorId || !section || !objectId || !floorName) return;

        if (!result[objectName]) result[objectName] = {};
        if (!result[objectName][floorName]) result[objectName][floorName] = {};

        // Убедитесь, что данные для объекта передаются корректно
        result[objectName][floorName][section] = {
            id: item.id,
            title: item[config.titleKey],
            pricePerM2: item[config.priceM2Key],
            totalPrice: item[config.totalPriceKey],
            img: item[config.img],
            classObject: classValue,
            features: featuresValues,
            freeObject: item[config.freeObject],
            linkPlan: item[config.linkPlan],
        };
    });

    return result;
}