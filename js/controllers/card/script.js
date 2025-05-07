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
    card: true
}).then(generateCard);

function generateCard(data) {
    let html = '';

    for (const objectName in data) {
        const floors = data[objectName].floors;
        const sortedFloors = Object.keys(floors).sort((a, b) => b - a);

        for (const floorNumber of sortedFloors) {
            const apartments = floors[floorNumber];

            for (const section in apartments) {
                const apt = apartments[section];
                const title = apt.title || '';
                const roundedValue = title ? Math.round(parseFloat(title)) : '';
                const img = (apt.img && apt.img[0]?.url) || '';
                const totalPrice = apt.totalPrice || '';
                const pricePerM2 = apt.pricePerM2 || '';

                html += `<div class="card-item">\n`;

                // Добавляем картинки (если есть массив)
                html += `<div class="card-slider">`;

                if (Array.isArray(apt.img)) {
                    apt.img.forEach((image, index) => {
                        html += `<div class="item">`;
                        html += `<img src="${image.urlMachine}" alt="Image ${index + 1}" style="max-width: 100%;">`;
                        html += `</div>`;
                    });
                }                              

                html += `</div>`; // Закрываем .card-slider

                // Информация о квартире
                html += `<div class="card-info">
            <div class="texts">
                <span>№ ${apt.id || ''}</span>
                <b>${roundedValue} м2</b>
            </div>
            <div class="prices">
                <span class="price">${totalPrice} ₸</span>
                <span class="small-price">${pricePerM2} ₸/м2</span>
            </div>
        </div>`;

                // Секция
                html += `<ul class="list">
            <li><span>Секция</span><span>${section}</span></li>
            <li><span>Срок сдачи</span><span>Сдан</span></li>
        </ul>`;

                // Кнопки
                html += `<div class="btns">
            <a href="#">A+</a>
            <a href="#">С мебелью</a>
            <a href="#">Чистовая отделка</a>
        </div>`;

                html += `</div>\n`; // Закрываем .card-item



            }
        }
    }

    document.getElementById('outputCards').innerHTML = html;
}
