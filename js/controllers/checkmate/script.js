// Базовый
getCombinedDataGeneric({
    listUrl,
    fieldsUrl,
    objectKey: 'ufCrm11_1746081771',
    floorKey: 'ufCrm11_1746081807',
    sectionKey: 'ufCrm11_1746511107',
    titleKey: 'ufCrm11_1746160745931',
    checkmate: true
}).then(generateCheckmate);


function generateCheckmate(data) {
    let html = ''; // Это правильно объявленная переменная

    // Процесс генерации HTML
    for (const objectName in data) {
        const floors = data[objectName].floors;

        // Сортировка этажей по убыванию
        const sortedFloors = Object.keys(floors).sort((a, b) => b - a);

        html += `<div class="checkerboard-item">\n<h3>${objectName}</h3>\n<ul>\n`;

        for (const floorNumber of sortedFloors) {
            const apartments = floors[floorNumber]; // объект с квартирами
            html += `  <li>\n    <span class="number">${floorNumber}</span>\n`;

            // Сортировка квартир по ключу
            const sortedApartmentKeys = Object.keys(apartments).sort((a, b) => a - b);

            for (let i = 0; i < 9; i++) {
                const aptKey = sortedApartmentKeys[i];
                const title = aptKey ? apartments[aptKey] : '';
                const roundedValue = title ? Math.round(parseFloat(title)) : '';
                const extraClass = title ? 'green' : ''; // или логика для класса

                html += `    <span class="cube ${extraClass}">${roundedValue || ''}</span>\n`;
            }

            html += `  </li>\n`;
        }

        html += `</ul>\n</div>\n`;
    }

    document.getElementById('outputCheckmate').innerHTML = html; // Выводим на страницу
}