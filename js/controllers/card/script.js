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
    features: 'ufCrm11_1746790826',
    freeObject: 'ufCrm11_1746081669',
    linkPlan: 'ufCrm11_1746709347',
    card: true
}).then(data => {
    generateCard(data);         // Первоначальный рендер
    setupCardFilterListeners(data);  // Подключаем автофильтрацию
});

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
        const features = apt.features || [];
        const linkPlan = apt.linkPlan || [];

        html += `<div class="card-item" onclick="window.location.href='checkerboard-objects.html?id=${apt.id}'">\n`;

        // Слайдер
        html += `<div class="card-slider">`;

        html += `<div class="item">
                    <img src="${linkPlan || ''}" style="max-width: 100%;">
                 </div>`;
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
        if (Array.isArray(features) && features.length > 0) {
            if (classObject) {
                html += `<a>${classObject}</a>\n`;
            }

            features.forEach(value => {
                html += `<a>${value}</a>\n`;
            });
        }
        html += `</div>\n`;

        html += `</div>\n`; // Закрываем .card-item
    }

    document.getElementById('outputCards').innerHTML = html;
}

function applyCardFilters(data) {
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

  generateCard(filteredData);
}

function setupCardFilterListeners(data) {
  const selectors = [
    '#area-min', '#area-max',
    '#price-min', '#price-max',
    '#class-select', '#object-select', '#floor-select',  // Добавили селектор этажа
    'input[name="feature"]'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(input => {
      input.addEventListener('input', () => applyCardFilters(data));
      input.addEventListener('change', () => applyCardFilters(data));
    });
  });

  // Для select2
  const classSelect = $('#class-select');
  if (classSelect.length) {
    console.log('Select2 для класса объекта найден');
    classSelect.on('select2:select', function(e) {
      const selectedClass = e.params.data.id;
      console.log('Класс изменён на:', selectedClass);  // Логируем изменение
      applyCardFilters(data);
    });
  }

  const objectSelect = $('#object-select');
  if (objectSelect.length) {
    console.log('Select2 для объектов найден');
    objectSelect.on('select2:select', function(e) {
      const selectedObject = e.params.data.id;
      console.log('Объект изменён на:', selectedObject);  // Логируем изменение
      applyCardFilters(data);
    });
  }

  const floorSelect = $('#floor-select');
  if (floorSelect.length) {
    console.log('Select2 для этажей найден');
    floorSelect.on('select2:select', function(e) {
      const selectedFloor = e.params.data.id;
      console.log('Этаж изменён на:', selectedFloor);  // Логируем изменение
      applyCardFilters(data);
    });
  }
}