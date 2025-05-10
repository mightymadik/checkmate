const params = new URLSearchParams(window.location.search);
const aptId = params.get('id');

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
    card: true
}).then(data => {
    const apartment = findApartmentById(data, aptId);
    if (apartment) {
        renderDetail(apartment);
    } else {
        document.body.innerHTML = '<p>Объект не найдена</p>';
    }
});

function findApartmentById(data, id) {
    for (const objectName in data) {
        const floors = data[objectName].floors;
        for (const floor in floors) {
            const sections = floors[floor];
            for (const section in sections) {
                const apt = sections[section];
                if (String(apt.id) === id) {
                    return {
                        apt,
                        floor,
                        section,
                        objectName
                    };
                }
            }
        }
    }
    return null;
}

function renderDetail({ apt, floor, section, objectName }) {
    const cleanedPricePerM2 = (apt.pricePerM2 || '').replace(/KZT|\|/g, '').trim();

    document.querySelector('#detail-title').textContent = `№ ${apt.id}`;
    document.querySelector('#detail-title1').textContent = `№ ${apt.id}`;
    document.querySelector('#detail-price').textContent = `${Number(apt.totalPrice).toLocaleString('ru-RU')} ₸`;
    document.querySelector('#detail-pricePerM2').textContent = `${Number(cleanedPricePerM2).toLocaleString('ru-RU')} ₸/м²`;
    document.querySelector('#detail-area').textContent = `${Math.round(parseFloat(apt.title))} м²`;

    document.querySelector('#detail-floor').textContent = `${floor}`;
    document.querySelector('#detail-section').textContent = `${section}`;
    document.querySelector('#detail-object').textContent = `${objectName}`;
    const classContainer = document.querySelector('#detail-class-container');
    classContainer.innerHTML = ''; // очищаем старые теги

    if (apt.classObject) {
        const tag = document.createElement('a');
        tag.className = 'tag';
        tag.textContent = apt.classObject;
        classContainer.appendChild(tag);
    }

    if (Array.isArray(apt.features)) {
        apt.features.forEach(feature => {
            const tag = document.createElement('a');
            tag.className = 'tag';
            tag.textContent = feature;
            classContainer.appendChild(tag);
        });
    }

    if (apt.img) {
        const imgElement = document.querySelector('#detail-img');

        if (Array.isArray(apt.img)) {
            // Если массив, берём первый элемент и его ссылку
            const firstImage = apt.img[0];
            if (firstImage && firstImage.urlMachine) {
                imgElement.src = firstImage.urlMachine;
                imgElement.alt = `Фото квартиры №${apt.id}`;
            }
        } else if (typeof apt.img === 'object' && apt.img.urlMachine) {
            // Если один объект
            imgElement.src = apt.img.urlMachine;
            imgElement.alt = `Фото квартиры №${apt.id}`;
        } else if (typeof apt.img === 'string') {
            // На случай строки
            imgElement.src = apt.img;
            imgElement.alt = `Фото квартиры №${apt.id}`;
        }
    }
}

