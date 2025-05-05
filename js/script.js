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
  
  

});
