const listUrl = 'https://crm.uak.kz/rest/219/0ltilbn9jqxg5ip4/crm.item.list?entityTypeId=1060';
const fieldsUrl = 'https://crm.uak.kz/rest/219/0ltilbn9jqxg5ip4/crm.item.fields?entityTypeId=1060';

async function fetchAllItems(url) {
  let allItems = [];
  let start = 0;

  while (true) {
    // Собираем URL: поддерживаем как ? , так и & в зависимости от исходного url
    const paginatedUrl = url.includes('?')
      ? `${url}&start=${start}`
      : `${url}?start=${start}`;

    const res = await fetch(paginatedUrl);
    if (!res.ok) {
      console.error('Ошибка при запросе:', res.status);
      break;
    }

    const data = await res.json();

    if (!data.result || !Array.isArray(data.result.items)) {
      console.error('Ошибка или пустые данные:', data);
      break;
    }

    // Добавляем текущие элементы
    allItems = allItems.concat(data.result.items);

    // Проверяем pagination-token в корне ответа
    if (typeof data.next !== 'undefined' && data.next > 0) {
      start = data.next;        // теперь берём его из data.next
    } else {
      break;
    }
  }

  console.log(`Общее количество элементов: ${allItems.length}`);
  return allItems;
}

async function getGroupedItemsByObjectName() {
  try {
    const [allItems, fieldsRes] = await Promise.all([
      fetchAllItems(listUrl),
      fetch(fieldsUrl).then(res => res.json())
    ]);

    const fieldValues = fieldsRes?.result?.fields?.['ufCrm11_1746081771'];
    const idToNameMap = {};

    if (fieldValues?.items) {
      fieldValues.items.forEach(obj => {
        idToNameMap[obj.ID] = obj.VALUE;
      });
    } else {
      console.error("Не удалось получить значения для ufCrm11_1746081771");
    }

    const groupedItems = {};

    allItems.forEach(item => {
      const objectId = item['ufCrm11_1746081771'];
      const objectName = idToNameMap[objectId] || 'Неизвестно';

      if (!groupedItems[objectName]) {
        groupedItems[objectName] = [];
      }

      groupedItems[objectName].push(item);
    });

    return groupedItems;
  } catch (err) {
    console.error('Ошибка при получении данных:', err);
    return {};
  }
}

async function getFloorsAndSectionsByObject() {
  try {
    const [fieldsRes, allItems] = await Promise.all([fetch(fieldsUrl).then(res => res.json()), fetchAllItems(listUrl)]);

    const floorField = fieldsRes.result.fields?.ufCrm11_1746081807;
    const objectField = fieldsRes.result.fields?.ufCrm11_1746081771;

    if (!floorField?.items || !objectField?.items) {
      console.error("Ошибка: нет нужных полей");
      return {};
    }

    const floorMap = {};
    floorField.items.forEach(item => {
      floorMap[item.ID] = item.VALUE;
    });

    const objectIdToName = {};
    objectField.items.forEach(item => {
      objectIdToName[item.ID] = item.VALUE;
    });

    const result = {};

    allItems.forEach(item => {
      const floorId = item.ufCrm11_1746081807;
      const section = item.ufCrm11_1746511107;
      const title = item.ufCrm11_1746160745931;
      const objectId = item.ufCrm11_1746081771;

      if (!floorId || !section || !objectId) return;

      const floorValue = floorMap[floorId];
      const objectName = objectIdToName[objectId] || 'Неизвестно';

      if (!floorValue) return;

      if (!result[objectName]) result[objectName] = {};
      if (!result[objectName][floorValue]) result[objectName][floorValue] = {};

      result[objectName][floorValue][section] = title;
    });

    return result;
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
    return {};
  }
}

async function getCombinedData() {
  try {
    const groupedItems = await getGroupedItemsByObjectName();
    const floorsByObject = await getFloorsAndSectionsByObject();

    const combinedData = {};

    for (const objectName in groupedItems) {
      combinedData[objectName] = {
        items: groupedItems[objectName],
        floors: floorsByObject[objectName] || {},  // теперь floors индивидуальны
      };
    }

    return combinedData;
  } catch (err) {
    console.error('Ошибка при объединении данных:', err);
    return {};
  }
}

function generateHTML(data) {
  let html = ''; // Это правильно объявленная переменная

  // Процесс генерации HTML
  for (const objectName in data) {
    const floors = data[objectName].floors;

    // Сортировка этажей по убыванию
    const sortedFloors = Object.keys(floors).sort((a, b) => b - a);

    html += `<div class="checkerboard-item">\n<h3>${objectName}</h3>\n<ul>\n`;

    for (const floorNumber of sortedFloors) {
      const apartments = floors[floorNumber]; // объект с квартирами
      html += `  <li>\n    <span class="number">${floorNumber}</span>\n`;

      // Сортировка квартир по ключу
      const sortedApartmentKeys = Object.keys(apartments).sort((a, b) => a - b);

      for (let i = 0; i < 9; i++) {
        const aptKey = sortedApartmentKeys[i];
        const title = aptKey ? apartments[aptKey] : '';
        const roundedValue = title ? Math.round(parseFloat(title)) : '';
        const extraClass = title ? 'green' : ''; // или логика для класса

        html += `    <span class="cube ${extraClass}">${roundedValue || ''}</span>\n`;
      }

      html += `  </li>\n`;
    }

    html += `</ul>\n</div>\n`;
  }

  document.getElementById('output').innerHTML = html; // Выводим на страницу
}

getCombinedData().then(combinedData => {
  generateHTML(combinedData); // передаём весь комбинированный объект
});

