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