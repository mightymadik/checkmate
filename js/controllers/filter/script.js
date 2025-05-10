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
    filter: true
}).then(generateFilter);

function generateFilter(data, keys) {
    const objects = Object.keys(data);
    console.log(data);
    // Собираем уникальные значения для фильтров
    const floorsSet = new Set();
    const classesSet = new Set();
    const featuresSet = new Set();
    const areas = [];
    const prices = [];

    objects.forEach(objectName => {
        const object = data[objectName];

        // Собираем этажи
        if (object.floors) {
            Object.keys(object.floors).forEach(floor => {
                floorsSet.add(floor);
            });
        }

        // Собираем классы

        Object.values(data).forEach(item => {
            if (item.floors) {
                Object.values(item.floors).forEach(floor => {
                    if (floor && typeof floor === "object") {
                        Object.values(floor).forEach(flat => {
                            if (flat.classObject) {
                                classesSet.add(flat.classObject);
                            }
                        });
                    }
                });
            }
        })
        Object.values(data).forEach(block => {
            Object.values(block.floors).forEach(floor => {
                Object.values(floor).forEach(item => {
                    if (item.classObject) {
                        classesSet.add(item.classObject);
                    }

                    if (item.title) {
                        areas.push(parseFloat(item.title.replace(',', '.')));
                    }

                    if (item.totalPrice) {
                        prices.push(item.totalPrice);
                    }

                    if (Array.isArray(item.features)) {
                        item.features.forEach(f => featuresSet.add(f));
                    }
                });
            });
        });
    });
    const minArea = Math.floor(Math.min(...areas));
    const maxArea = Math.ceil(Math.max(...areas));

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Преобразуем множества в массивы
    const floors = Array.from(floorsSet).sort();
    const classObjects = Array.from(classesSet);
    const features = Array.from(featuresSet);

    // Генерация HTML-фильтра
    const html = `
    <div class="info">
      <div class="select-info">
        <span>Объекты</span>
        <div class="select-wrap">
          <select id="object-select">
            <option value="">Все</option>
            ${objects.map(obj => `<option value="${obj}">${obj}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="inputs-info">
        <span>Площадь, м²</span>
        <div class="inputs">
          <input type="number" id="area-min" placeholder="от ${minArea}">
          <input type="number" id="area-max" placeholder="до ${maxArea}">
        </div>
      </div>

      <div class="inputs-info">
        <span>Стоимость, ₸</span>
        <div class="inputs">
          <input type="number" id="price-min" placeholder="от ${minPrice}">
          <input type="number" id="price-max" placeholder="до ${maxPrice}">
        </div>
      </div>

      <div class="select-info">
        <span>Этажи</span>
        <div class="select-wrap">
          <select id="floor-select">
            <option value="">Все</option>
            ${floors.map(f => `<option value="${f}">${f}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="select-info">
        <span>Класс объекта</span>
        <div class="select-wrap">
          <select id="class-select">
            <option value="">Все</option>
            ${classObjects.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="checkboxes">
      ${features.map(f => `
        <div class="checkbox-wrap">
          <label>
            <input type="checkbox" name="feature" value="${f}">
            <span></span>
            ${f}
          </label>
        </div>
      `).join('')}
    </div>
  `;
    document.querySelector("#filters-container").innerHTML = html;
    $('.select-wrap select').select2({
        minimumResultsForSearch: 6
    });
}