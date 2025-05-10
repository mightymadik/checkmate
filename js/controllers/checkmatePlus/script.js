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
    linkPlan: 'ufCrm11_1746709347',
    classObject: 'ufCrm11_1746641732',
    features: 'ufCrm11_1746790826',
    id: 'id',
    checkmatePlus: true
}).then(data => {
    generateCheckmatePlus(data);         // Первоначальный рендер
    setupCheckmatePlusFilterListeners(data);  // Подключаем автофильтрацию
});

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
                const aptKey = String(i + 1); // <- позиция в сетке от 0 до 8
                const apt = apartments[aptKey] || null;

                let planLink = '', img = '', title = '', roundedValue = '', id = '', imgAttributes = '', totalPrice = '', pricePerM2 = '', colorClass = '';

                if (apt) {
                    title = apt.title || '';
                    roundedValue = title ? Math.round(parseFloat(title)) : '';
                    id = apt.id || '';
                    img = (apt.img && (apt.img[0]?.urlMachine || apt.img[0]?.url)) || '';
                    planLink = apt.linkPlan || [];
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
                }

                html += `
      <div class="cube ${colorClass}"
           data-title="${title}"
           data-id="${id}"
           data-total-price="${totalPrice}"
           data-price-per-m2="${pricePerM2}"
           data-link-plan="${planLink}">
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

function applyCheckmatePlusFilters(data) {
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

    generateCheckmatePlus(filteredData);
}

function setupCheckmatePlusFilterListeners(data) {
    const selectors = [
        '#area-min', '#area-max',
        '#price-min', '#price-max',
        '#class-select', '#object-select', '#floor-select',  // Добавили селектор этажа
        'input[name="feature"]'
    ];

    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', () => applyCheckmatePlusFilters(data));
            input.addEventListener('change', () => applyCheckmatePlusFilters(data));
        });
    });

    // Для select2
    const classSelect = $('#class-select');
    if (classSelect.length) {
        console.log('Select2 для класса объекта найден');
        classSelect.on('select2:select', function (e) {
            const selectedClass = e.params.data.id;
            console.log('Класс изменён на:', selectedClass);  // Логируем изменение
            applyCheckmatePlusFilters(data);
        });
    }

    const objectSelect = $('#object-select');
    if (objectSelect.length) {
        console.log('Select2 для объектов найден');
        objectSelect.on('select2:select', function (e) {
            const selectedObject = e.params.data.id;
            console.log('Объект изменён на:', selectedObject);  // Логируем изменение
            applyCheckmatePlusFilters(data);
        });
    }

    const floorSelect = $('#floor-select');
    if (floorSelect.length) {
        console.log('Select2 для этажей найден');
        floorSelect.on('select2:select', function (e) {
            const selectedFloor = e.params.data.id;
            console.log('Этаж изменён на:', selectedFloor);  // Логируем изменение
            applyCheckmatePlusFilters(data);
        });
    }
}