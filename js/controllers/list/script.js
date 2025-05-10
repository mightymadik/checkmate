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
  console.log(data);
  generateList(data);
  setupListFilterListeners(data);
});

function generateList(data) {
  let html = '';
  const apartmentsList = [];

  for (const objectName in data) {
    const floors = data[objectName].floors;

    for (const floorNumber in floors) {
      const apartments = floors[floorNumber];

      for (const section in apartments) {
        const apt = apartments[section];
        if (Array.isArray(apt.freeObject)) {
          if (!apt.freeObject.includes(2081)) continue;
        } else {
          if (apt.freeObject != 2081) continue;
        }

        const totalPriceNum = Number(apt.totalPrice);
        if (isNaN(totalPriceNum)) continue;

        apartmentsList.push({
          apt,
          floorNumber,
          totalPriceNum,
          roundedValue: apt.title ? Math.round(parseFloat(apt.title)) : '',
        });
      }
    }
  }

  // Сортировка по возрастанию общей цены
  apartmentsList.sort((a, b) => a.totalPriceNum - b.totalPriceNum);

  for (const item of apartmentsList) {
    const { apt, floorNumber, totalPriceNum, roundedValue } = item;
    const totalPrice = totalPriceNum.toLocaleString('ru-RU');
    const pricePerM2 = (apt.pricePerM2 || '').replace(/KZT|\|/g, '').trim();
    const classObject = apt.classObject || [];
    const features = apt.features || [];
    const linkPlan = apt.linkPlan || [];

    html += `<div class="list-item" onclick="window.location.href='checkerboard-objects.html?id=${apt.id}'">
      <div class="info-wrap">
        <div class="wrap">
          <div class="info">
            <div class="top">
              <img src="img/filter-icon.svg" alt="">
              <span>План</span>
            </div>`;
    html += `<div class="img">
                    <img src="${linkPlan || ''}" style="max-width: 100%;">
                 </div>`;
    html += `</div>
          <div class="info">
            <div class="top">
              <img src="img/filter-icon.svg" alt="">
              <span>Номер</span>
            </div>
            <div class="texts">
              <b>№${apt.id || ''}</b>
            </div>
          </div>
        </div>
        <div class="info">
          <div class="top">
            <img src="img/filter-icon.svg" alt="">
            <span>Площадь</span>
          </div>
          <div class="texts">
            <b>${roundedValue}</b>
          </div>
        </div>
        <div class="info">
          <div class="top">
            <img src="img/filter-icon.svg" alt="">
            <span>Цена, ₸/м2</span>
          </div>
          <div class="texts">
            <b>${pricePerM2}</b>
          </div>
        </div>
        <div class="info">
          <div class="top">
            <img src="img/filter-icon.svg" alt="">
            <span>Стоимость, ₸</span>
          </div>
          <div class="texts">
            <b>${totalPrice}</b>
          </div>
        </div>
        <div class="info">
          <div class="top">
            <img src="img/filter-icon.svg" alt="">
            <span>Этаж</span>
          </div>
          <div class="texts">
            <b>${floorNumber}</b>
          </div>
        </div>
        <div class="info">
          <div class="top">
            <img src="img/filter-icon.svg" alt="">
            <span>Тип</span>
          </div>
          <div class="tags">`;
    if (Array.isArray(features) && features.length > 0) {
      if (classObject) {
        html += `<a class="tag">${classObject}</a>\n`;
      }

      features.forEach(value => {
        html += `<a class="tag">${value}</a>\n`;
      });
    }

    html += `</div>
        </div>
      </div>
    </div>`;
  }

  document.getElementById('outputList').innerHTML = html;
}

function applyListFilters(data) {
  const areaMin = parseFloat(document.getElementById('area-min')?.value) || 0;
  const areaMax = parseFloat(document.getElementById('area-max')?.value) || Infinity;
  const priceMin = parseFloat(document.getElementById('price-min')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('price-max')?.value) || Infinity;
  const selectedClass = document.getElementById('class-select')?.value || '';
  const selectedObject = document.getElementById('object-select')?.value || '';
  const selectedFloor = document.getElementById('floor-select')?.value || '';
  const selectedFeatures = Array.from(document.querySelectorAll('input[name="feature"]:checked'))
    .map(input => input.value);

  const filteredData = {};

  for (const objectName in data) {
    if (selectedObject && objectName !== selectedObject) continue;

    const floors = data[objectName].floors;
    const filteredFloors = {};

    for (const floorNumber in floors) {
      if (selectedFloor && floorNumber !== selectedFloor) continue;

      const apartments = floors[floorNumber];
      const filteredApts = {};

      for (const section in apartments) {
        const apt = apartments[section];

        if (Array.isArray(apt.freeObject)) {
          if (!apt.freeObject.includes(2081)) continue;
        } else {
          if (apt.freeObject != 2081) continue;
        }


        const area = parseFloat((apt.title || '0').replace(',', '.'));
        const price = parseFloat(apt.totalPrice || '0');

        const inAreaRange = area >= areaMin && area <= areaMax;
        const inPriceRange = price >= priceMin && price <= priceMax;
        const classValue = Array.isArray(apt.classObject)
          ? apt.classObject[0]
          : String(apt.classObject || '').trim();

        const matchesClass = !selectedClass || classValue === selectedClass;
        const aptFeatures = Array.isArray(apt.features) ? apt.features : [];
        const matchesFeatures = selectedFeatures.every(f => aptFeatures.includes(f));

        if (inAreaRange && inPriceRange && matchesClass && matchesFeatures) {
          filteredApts[section] = apt;
        }
      }

      if (Object.keys(filteredApts).length > 0) {
        filteredFloors[floorNumber] = filteredApts;
      }
    }

    if (Object.keys(filteredFloors).length > 0) {
      filteredData[objectName] = { floors: filteredFloors };
    }
  }

  console.log('Filtered data:', filteredData);
  generateList(filteredData);
}

function setupListFilterListeners(data) {
  const selectors = [
    '#area-min', '#area-max',
    '#price-min', '#price-max',
    '#class-select', '#object-select', '#floor-select',  // Добавили селектор этажа
    'input[name="feature"]'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(input => {
      input.addEventListener('input', () => applyListFilters(data));
      input.addEventListener('change', () => applyListFilters(data));
    });
  });

  // Для select2
  const classSelect = $('#class-select');
  if (classSelect.length) {
    console.log('Select2 для класса объекта найден');
    classSelect.on('select2:select', function (e) {
      const selectedClass = e.params.data.id;
      console.log('Класс изменён на:', selectedClass);  // Логируем изменение
      applyListFilters(data);
    });
  }

  const objectSelect = $('#object-select');
  if (objectSelect.length) {
    console.log('Select2 для объектов найден');
    objectSelect.on('select2:select', function (e) {
      const selectedObject = e.params.data.id;
      console.log('Объект изменён на:', selectedObject);  // Логируем изменение
      applyListFilters(data);
    });
  }

  const floorSelect = $('#floor-select');
  if (floorSelect.length) {
    console.log('Select2 для этажей найден');
    floorSelect.on('select2:select', function (e) {
      const selectedFloor = e.params.data.id;
      console.log('Этаж изменён на:', selectedFloor);  // Логируем изменение
      applyListFilters(data);
    });
  }
}