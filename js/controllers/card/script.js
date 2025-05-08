// Базовый
getCombinedDataGeneric({
    listUrl,
    fieldsUrl,
    objectKey: 'ufCrm11_1746081771',
    floorKey: 'ufCrm11_1746081807',
    sectionKey: 'ufCrm11_1746511107',
    titleKey: 'ufCrm11_1746160745931',
    priceM2Key: 'ufCrm11_1746160954591',
    totalPriceKey: 'opportunity',
    img: 'ufCrm11_1746636341',
    classObject: 'ufCrm11_1746641732',
    freeObject: 'ufCrm11_1746081669',
    card: true
}).then(generateCard);

function generateCard(data) {
    let html = '';
    const apartmentsList = [];

    for (const objectName in data) {
        const floors = data[objectName].floors;

        for (const floorNumber in floors) {
            const apartments = floors[floorNumber];

            for (const section in apartments) {
                const apt = apartments[section];
                if (String(apt.freeObject) !== '2081') continue;

                const totalPriceNum = Number(apt.totalPrice);
                if (isNaN(totalPriceNum)) continue;

                apartmentsList.push({
                    apt,
                    section,
                    totalPriceNum,
                    roundedValue: apt.title ? Math.round(parseFloat(apt.title)) : '',
                });
            }
        }
    }

    // Сортировка по общей цене от дешевого к дорогому
    apartmentsList.sort((a, b) => a.totalPriceNum - b.totalPriceNum);

    // Формирование HTML
    for (const item of apartmentsList) {
        const { apt, section, totalPriceNum, roundedValue } = item;
        const img = (apt.img && apt.img[0]?.url) || '';
        const totalPrice = totalPriceNum.toLocaleString('ru-RU');
        const pricePerM2 = (apt.pricePerM2 || '').replace(/KZT|\|/g, '').trim();
        const classObject = apt.classObject || [];

        html += `<div class="card-item" onclick="window.location.href='checkerboard-objects.html?id=${apt.id}'">\n`;

        // Слайдер
        html += `<div class="card-slider">`;
        if (Array.isArray(apt.img)) {
            apt.img.forEach((image, index) => {
                html += `<div class="item">
                            <img src="${image.urlMachine}" alt="Image ${index + 1}" style="max-width: 100%;">
                         </div>`;
            });
        }
        html += `</div>`; // Закрываем .card-slider

        // Информация
        html += `<div class="card-info">
            <div class="texts">
                <span>№ ${apt.id || ''}</span>
                <b>${roundedValue} м²</b>
            </div>
            <div class="prices">
                <span class="price">${totalPrice} ₸</span>
                <span class="small-price">${pricePerM2} ₸/м²</span>
            </div>
        </div>`;

        // Секция
        html += `<ul class="list">
            <li><span>Секция</span><span>${section}</span></li>
        </ul>`;

        // Кнопки
        html += `<div class="btns">`;
        if (Array.isArray(classObject)) {
            classObject.forEach(value => {
                html += `<a>${value}</a>`;
            });
        }
        html += `</div>\n`;

        html += `</div>\n`; // Закрываем .card-item
    }

    document.getElementById('outputCards').innerHTML = html;
}
