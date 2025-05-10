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
    linkPlan: 'ufCrm11_1746709347',
    classObject: 'ufCrm11_1746641732',
    features: 'ufCrm11_1746790826',
    checkmate: true
}).then(data => {
    generateCheckmate(data);         // Первоначальный рендер
    setupCheckmateFilterListeners(data);  // Подключаем автофильтрацию
});

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
                const aptKey = String(i+1); // ← индекс как ключ
                const apartment = apartments[aptKey] || null; // ← строго по позиции

                let className = 'cube';
                let value = '';
                let id = '';
                let price = '';
                let pricePerM2 = '';
                let imgAttributes = '';
                let planLink = '';
                let objectClass = '';
                let dataMebel = '';
                let dataOtdelka = '';
                let dataSvobodnaya = '';

                if (apartment) {
                    const freeObject = apartment.freeObject;
                    const title = apartment.title;
                    const roundedValue = title ? Math.round(parseFloat(title)) : '';
                    const img = (apartment.img && apartment.img[0]?.url) || '';
                    const linkPlan = apartment.linkPlan || [];

                    if (Array.isArray(apartment.features)) {
                        dataMebel = apartment.features.includes('С мебелью') ? '1' : '0';
                        dataOtdelka = apartment.features.includes('Чистовая отделка') ? '1' : '0';
                        dataSvobodnaya = apartment.features.includes('Свободная планировка') ? '1' : '0';
                    }

                    objectClass = apartment.classObject || '';
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

                    planLink = apartment.linkPlan || '';
                }

                html += `<span class="${className}" 
        data-id="${id}"
        data-object="${objectName}" 
        data-title="${value}" 
        data-total-price="${price}" 
        data-price-per-m2="${pricePerM2}" 
        data-floor="${floorNumber}" 
        data-class="${objectClass}"
        data-mebel="${dataMebel}"
        data-otdelka="${dataOtdelka}"
        data-svobodnaya="${dataSvobodnaya}"
        data-link-plan="${planLink}"
    >${value}</span>\n`;
            }



            html += `</li>\n`;
        }

        html += `</ul>\n</div>\n`;
    }

    // Выводим счётчик
    document.getElementById('freeCounter').innerHTML = `<p>Свободно ${freeCount} помещений</p>`;
    document.getElementById('outputCheckmate').innerHTML = html;
}

function applyCheckmateFilters(data) {
    // Получаем значения из фильтров
    const areaMin = parseFloat(document.getElementById('area-min')?.value) || 0;
    const areaMax = parseFloat(document.getElementById('area-max')?.value) || Infinity;
    const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
    const selectedClass = document.getElementById('class-select')?.value || '';
    const selectedObject = document.getElementById('object-select')?.value || '';
    const selectedFloor = document.getElementById('floor-select')?.value || '';  // Новая переменная для этажа
    const selectedFeatures = Array.from(document.querySelectorAll('input[name="feature"]:checked'))
        .map(input => input.value);

    // Фильтруем копию данных
    const filteredData = {};

    for (const objectName in data) {
        if (selectedObject && objectName !== selectedObject) continue;  // Применяем фильтр по объекту

        const floors = data[objectName].floors;
        const filteredFloors = {};

        for (const floorNumber in floors) {
            if (selectedFloor && floorNumber !== selectedFloor) continue;  // Применяем фильтр по этажу

            const apartments = floors[floorNumber];
            const filteredApts = {};

            for (const aptNumber in apartments) {
                const apt = apartments[aptNumber];
                const area = parseFloat(apt.title?.replace(',', '.') || 0);
                const price = parseFloat(apt.totalPrice || 0);
                const matchesClass = !selectedClass || apt.classObject === selectedClass;
                const features = Array.isArray(apt.features) ? apt.features : [];

                const matchesFeatures = selectedFeatures.every(feature =>
                    features.includes(feature)
                );

                const inAreaRange = area >= areaMin && area <= areaMax;
                const inPriceRange = price >= priceMin && price <= priceMax;

                if (inAreaRange && inPriceRange && matchesClass && matchesFeatures) {
                    filteredApts[aptNumber] = apt;
                }
            }

            if (Object.keys(filteredApts).length) {
                filteredFloors[floorNumber] = filteredApts;
            }
        }

        if (Object.keys(filteredFloors).length) {
            filteredData[objectName] = { floors: filteredFloors };
        }
    }

    generateCheckmate(filteredData);
}

function setupCheckmateFilterListeners(data) {
    const selectors = [
        '#area-min', '#area-max',
        '#price-min', '#price-max',
        '#class-select', '#object-select', '#floor-select',  // Добавили селектор этажа
        'input[name="feature"]'
    ];

    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', () => applyCheckmateFilters(data));
            input.addEventListener('change', () => applyCheckmateFilters(data));
        });
    });

    // Для select2
    const classSelect = $('#class-select');
    if (classSelect.length) {
        console.log('Select2 для класса объекта найден');
        classSelect.on('select2:select', function (e) {
            const selectedClass = e.params.data.id;
            console.log('Класс изменён на:', selectedClass);  // Логируем изменение
            applyCheckmateFilters(data);
        });
    }

    const objectSelect = $('#object-select');
    if (objectSelect.length) {
        console.log('Select2 для объектов найден');
        objectSelect.on('select2:select', function (e) {
            const selectedObject = e.params.data.id;
            console.log('Объект изменён на:', selectedObject);  // Логируем изменение
            applyCheckmateFilters(data);
        });
    }

    const floorSelect = $('#floor-select');
    if (floorSelect.length) {
        console.log('Select2 для этажей найден');
        floorSelect.on('select2:select', function (e) {
            const selectedFloor = e.params.data.id;
            console.log('Этаж изменён на:', selectedFloor);  // Логируем изменение
            applyCheckmateFilters(data);
        });
    }
}