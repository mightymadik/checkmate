// Базовый
getCombinedDataGeneric({
    listUrl,
    fieldsUrl,
    objectKey: 'ufCrm11_1746081771',
    floorKey: 'ufCrm11_1746081807',
    sectionKey: 'ufCrm11_1746511107',
    titleKey: 'ufCrm11_1746160745931',
    img: 'ufCrm11_1746636341',
    priceM2Key: 'ufCrm11_1746160954591',
    freeObject: 'ufCrm11_1746081669',
    totalPriceKey: 'opportunity',
    checkmate: true
}).then(generateCheckmate);


function generateCheckmate(data) {
    let html = '';
    let freeCount = 0; // ← счётчик свободных помещений

    for (const objectName in data) {
        const floors = data[objectName].floors;
        const sortedFloors = Object.keys(floors).sort((a, b) => b - a);

        html += `<div class="checkerboard-item">\n<h3>${objectName}</h3>\n<ul>\n`;

        for (const floorNumber of sortedFloors) {
            const apartments = floors[floorNumber];
            html += `  <li>\n    <span class="number">${floorNumber}</span>\n`;

            const sortedApartmentKeys = Object.keys(apartments).sort((a, b) => a - b);

            for (let i = 0; i < 9; i++) {
                const aptKey = sortedApartmentKeys[i];
                const apartment = aptKey ? apartments[aptKey] : null;
            
                let className = 'cube';
                let value = '';
                let id = '';
                let price = '';
                let pricePerM2 = '';
                let imgAttributes = '';
            
                if (apartment) {
                    const freeObject = apartment.freeObject;
                    const title = apartment.title;
                    const roundedValue = title ? Math.round(parseFloat(title)) : '';
                    const img = (apartment.img && apartment.img[0]?.url) || '';
                    id = apartment?.id || '';
                    price = apartment?.totalPrice
                    ? Number(apartment.totalPrice).toLocaleString('ru-RU')
                    : '';
                    pricePerM2 = apartment?.pricePerM2
                    ? Number(
                        apartment.pricePerM2.replace(/KZT|\|/g, '').trim()
                    ).toLocaleString('ru-RU')
                    : '';
            
                    switch (freeObject) {
                        case 2081:
                            className += ' green';
                            value = roundedValue;
                            freeCount++;
                            break;
                        case 2083:
                            break;
                        case 2085:
                            className += ' yellow';
                            value = roundedValue;
                            break;
                        case 2087:
                            value = roundedValue;
                            break;
                    }
            
                    if (Array.isArray(apartment.img)) {
                        apartment.img.forEach((image) => {
                            imgAttributes += `${image.urlMachine}`;
                        });
                    }
                }
            
                html += `<span class="${className}" data-id="${id}" data-title="${value}" data-total-price="${price}" data-price-per-m2="${pricePerM2}" data-img="${imgAttributes}">${value}</span>\n`;
            }
            

            html += `</li>\n`;
        }

        html += `</ul>\n</div>\n`;
    }

    // Выводим счётчик
    document.getElementById('freeCounter').innerHTML = `<p>Свободно ${freeCount} помещений</p>`;
    document.getElementById('outputCheckmate').innerHTML = html;
}
