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
}).then(generateList);

function generateList(data) {
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

      html += `<div class="list-item" onclick="window.location.href='checkerboard-objects.html?id=${apt.id}'">
      <div class="info-wrap">
        <div class="wrap">
          <div class="info">
            <div class="top">
              <img src="img/filter-icon.svg" alt="">
              <span>План</span>
            </div>`;
      if (Array.isArray(apt.img)) {
          apt.img.forEach((image, index) => {
              html += `<div class="img">
                          <img src="${image.urlMachine}" alt="Image ${index + 1}" style="max-width: 100%;">
                       </div>`;
          });
      }
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
      if (Array.isArray(classObject)) {
          classObject.forEach(value => {
              html += `<a class="tag">${value}</a>`;
          });
      }
      html += `</div>
        </div>
      </div>
    </div>`;
  }

  document.getElementById('outputList').innerHTML = html;
}

