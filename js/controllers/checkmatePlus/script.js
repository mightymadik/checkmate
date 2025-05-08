// Расширенный
getCombinedDataGeneric({
    listUrl,
    fieldsUrl,
    img: 'ufCrm11_1746636341',
    objectKey: 'ufCrm11_1746081771',
    floorKey: 'ufCrm11_1746081807',
    sectionKey: 'ufCrm11_1746511107',
    titleKey: 'ufCrm11_1746160745931',
    priceM2Key: 'ufCrm11_1746160954591',
    freeObject: 'ufCrm11_1746081669',
    totalPriceKey: 'opportunity',
    id: 'id',
    checkmatePlus: true
}).then(generateCheckmatePlus);

function generateCheckmatePlus(data) {
    let html = '';
    
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
                const apt = aptKey ? apartments[aptKey] : null;
                let img = '', title = '', roundedValue = '', id = '', imgAttributes = '', totalPrice = '', pricePerM2 = '', colorClass = '';

                if (apt) {
                    title = apt.title || '';
                    roundedValue = title ? Math.round(parseFloat(title)) : '';
                    id = apt.id || '';
                    const img = (apt.img && (apt.img[0]?.urlMachine || apt.img[0]?.url)) || '';
                    totalPrice = apt.totalPrice
                        ? Number(apt.totalPrice).toLocaleString('ru-RU')
                        : '';
                    pricePerM2 = apt.pricePerM2
                        ? Number(apt.pricePerM2.replace(/KZT|\|/g, '').trim()).toLocaleString('ru-RU')
                        : '';

                    switch (apt.freeObject) {
                        case 2081: colorClass = 'green'; break;
                        case 2085: colorClass = 'yellow'; break;
                        case 2087: colorClass = 'gray'; break;
                        case 2083: colorClass = ''; break;
                    }

                    if (Array.isArray(apt.img)) {
                        apt.img.forEach((image) => {
                            imgAttributes += `${image.urlMachine}`;
                        });
                    }
                }

                html += `
              <div class="cube ${colorClass}"
                   data-title="${title}"
                   data-id="${id}"
                   data-total-price="${totalPrice}"
                   data-price-per-m2="${pricePerM2}"
                   data-img="${imgAttributes}">
                <div class="top"><span>${id}</span><span>${roundedValue}</span></div>
                <div class="texts"><span>${pricePerM2} ₸/м2</span><span>${totalPrice} ₸</span></div>
              </div>\n`;
            }


            html += `  </li>\n`;
        }

        html += `</ul>\n</div>\n`;
    }

    document.getElementById('outputCheckmatePlus').innerHTML = html;
}