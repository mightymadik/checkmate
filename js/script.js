$(document).ready(function () {

  $(".phone-number-input").inputmask({
    mask: "+7 (999)-999-999-9",
  });

  $("#subscribe-form").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
    },
    messages: {
      email: {
        required: "Укажите корректный E-mail",
      },
    },
  });


  $(".select-wrap select").select2({
    minimumResultsForSearch: 6,
  });

  $('.card-slider').slick({
    dots: true,
    arrows: false,
    infinite: false,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
  });

  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
  
      const target = tab.getAttribute('data-tab');
      contents.forEach(c => {
        c.classList.remove('active');
        if (c.getAttribute('data-content') === target) {
          c.classList.add('active');
        }
      });
    });
  });
  
  function initAllTabSliders() {
    document.querySelectorAll('.tab-content .popup-slider').forEach(slider => {
      const $slider = $(slider);
      if (!$slider.hasClass('slick-initialized')) {
        $slider.slick({
          dots: true,
          arrows: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        });
      }
    });
  }
  
  initAllTabSliders(); // вызываем один раз при загрузке
  

  
  
  document.querySelectorAll('.checkerboard-items').forEach(items => {
    items.addEventListener('click', function (e) {
      if (!isMobile()) return;
  
      const cube = e.target.closest('.cube');
      if (!cube) return;
  
      currentCube = cube;
      showPopup(); // мобилка — центр
    });
  
    items.addEventListener('mouseover', function (e) {
      if (isMobile()) return;
  
      const cube = e.target.closest('.cube');
      if (!cube) return;
  
      currentCube = cube;
  
      const rect = cube.getBoundingClientRect();
      showPopup(rect.right, rect.top);
    });
  
    items.addEventListener('mouseout', function (e) {
      if (isMobile()) return;
  
      const related = e.relatedTarget;
      if (!popup.contains(related)) hidePopup();
    });
  });
  
  const popup = document.getElementById('popup');
  let currentCube = null;
  let popupVisible = false;

  const isMobile = () => window.innerWidth < 768;

  function showPopup(x = 0, y = 0) {
    popup.classList.remove('hidden');
    popupVisible = true;

    if (currentCube) {
      const title = currentCube.dataset.title || '';
      const totalPrice = currentCube.dataset.totalPrice || '';
      const pricePerM2 = currentCube.dataset.pricePerM2 || '';
      const id = currentCube.dataset.id || '';
      const img = currentCube.dataset.img || '';

      document.querySelector('#popup .popup-slider img').src = img;
      document.querySelector('#popup .top-info span').textContent = `№ ${id}`;
      document.querySelector('#popup .top-info b').textContent = `${title} м2`;
      document.querySelector('#popup .bottom-info .price').textContent = `${totalPrice} ₸`;
      document.querySelector('#popup .bottom-info .small-price').textContent = `${pricePerM2} ₸/м2`;
    }

    if (isMobile()) {
      popup.style.position = 'fixed';
      popup.style.left = '50%';
      popup.style.top = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
    } else {
      popup.style.position = 'absolute';
      popup.style.left = x + 'px';
      popup.style.top = y + 'px';
      popup.style.transform = 'none';
    }

    const slider = $('.popup-slider');
    if (!slider.hasClass('slick-initialized')) {
      slider.slick({
        dots: true,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
      });
    }
  }

  function hidePopup() {
    popup.classList.add('hidden');
    popupVisible = false;
    currentCube = null;
  }

  document.querySelector('.checkerboard-items').addEventListener('click', function (e) {
    if (!isMobile()) return;

    const cube = e.target.closest('.cube');
    if (!cube) return;

    currentCube = cube;
    showPopup(); // мобилка — центр
  });

  document.querySelector('.checkerboard-items').addEventListener('mouseover', function (e) {
    if (isMobile()) return;

    const cube = e.target.closest('.cube');
    if (!cube) return;

    currentCube = cube;

    const rect = cube.getBoundingClientRect();
    showPopup(rect.right, rect.top);
  });

  document.querySelector('.checkerboard-items').addEventListener('mouseout', function (e) {
    if (isMobile()) return;

    const related = e.relatedTarget;
    if (!popup.contains(related)) hidePopup();
  });

  popup.addEventListener('mouseover', () => { });
  popup.addEventListener('mouseout', (e) => {
    const related = e.relatedTarget;
    if (!popup.contains(related)) hidePopup();
  });

  document.getElementById('popup-close').addEventListener('click', hidePopup);

  window.addEventListener('resize', () => {
    if (!popupVisible || !currentCube) return;

    const rect = currentCube.getBoundingClientRect();

    if (isMobile()) {
      showPopup(); // центр
    } else {
      showPopup(rect.right, rect.top);
    }
  });
});
