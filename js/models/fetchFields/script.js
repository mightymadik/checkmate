async function fetchFieldValues(fieldsUrl, fieldKeys) {
    const fieldsRes = await fetch(fieldsUrl).then(res => res.json());
    const fields = fieldsRes?.result?.fields;

    const result = {};

    fieldKeys.forEach(key => {
        const field = fields?.[key];
        if (field?.items) {
            result[key] = {};
            field.items.forEach(item => {
                result[key][item.ID] = item.VALUE;
            });
        } else {
            console.error(`Поле ${key} не найдено или пустое`);
        }
    });

    return result;
}