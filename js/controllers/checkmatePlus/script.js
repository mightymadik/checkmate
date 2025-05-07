// Расширенный
getCombinedDataGeneric({
    listUrl,
    fieldsUrl,
    objectKey: 'ufCrm11_1746081771',
    floorKey: 'ufCrm11_1746081807',
    sectionKey: 'ufCrm11_1746511107',
    titleKey: 'ufCrm11_1746160745931',
    priceM2Key: 'ufCrm11_1746160954591',
    totalPriceKey: 'opportunity',
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

                const title = apt?.title || '';
                const roundedValue = title ? Math.round(parseFloat(title)) : '';
                const extraClass = title ? 'green' : '';

                html += `    <div class="cube ${extraClass}"><div class="top"><span>${apt?.id || ''}</span><span>${roundedValue}</span></div>\n`;
                html += `    <div class="texts"><span>${apt?.pricePerM2 || ''} ₸/м2</span><span>${apt?.totalPrice || ''} ₸</span></div></div>\n`;
            }

            html += `  </li>\n`;
        }

        html += `</ul>\n</div>\n`;
    }

    document.getElementById('outputCheckmatePlus').innerHTML = html;
}