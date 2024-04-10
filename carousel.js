function initializeCarousel(
  carousel,
  slides,
  nextButton,
  prevButton,
  horizontal = false
) {
  var carousel = $(carousel),
    currdeg = 0,
    slides = $(slides),
    numSlides = slides.length;

  if (horizontal) {
    xOrY = "Y";
  } else {
    xOrY = "X";
  }
  var carouselRadius = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--carouselRadius"
    )
  );

  var radiusFactor = 1 + Math.log10((numSlides / 7));

  // Apply initial transformations for each mode
  slides.each(function (index) {
    var rotationAngle = (index * 360) / numSlides;
    $(this).css(
      "transform",
      "rotate" +
        xOrY +
        "(" +
        rotationAngle +
        "deg) translateZ(" +
        carouselRadius * radiusFactor +
        "px)"
    );
  });

  // Add event handlers for Next and Prev buttons
  $(nextButton).on("click", { d: "n" }, rotate);
  $(prevButton).on("click", { d: "p" }, rotate);

  // Initialize the state of classes and start the carousel
  shiftClasses(0);

  function rotate(e) {
    var direction = e.data.d == "n" ? 1 : -1;
    currdeg += (direction * 360) / numSlides;
    if (currdeg % 360 > -1 && currdeg % 360 < 1) {
      currdeg -= currdeg % 360;
    }
    shiftClasses(direction);
  }

  function shiftClasses(direction) {
    var currentIndex = Math.round((currdeg / (360 / numSlides)) % numSlides);

    slides.removeClass("first second third");
    slides.eq(currentIndex).addClass("first");

    for (var i = 1; i <= numSlides - 1; i++) {
      var index = (currentIndex + i) % numSlides;
      var className = i === 1 || i === numSlides - 1 ? "second" : "third";
      slides.eq(index).addClass(className);
    }

    carousel.css({
      "-webkit-transform": "rotate" + xOrY + "(" + -currdeg + "deg)",
      "-moz-transform": "rotate" + xOrY + "(" + -currdeg + "deg)",
      "-o-transform": "rotate" + xOrY + "(" + -currdeg + "deg)",
      transform: "rotate" + xOrY + "(" + -currdeg + "deg)",
    });
  }
}

initializeCarousel(
  "#modeCarousel",
  ".mode",
  "#nextMode",
  "#prevMode",
  (horizontal = true)
);
initializeCarousel(
  "#keySignatureCarousel",
  ".keySignature",
  "#nextKey",
  "#prevKey",
  (horizontal = true)
);

function bkgndAndLed(frgndCanvasId, bkgndCanvasId, width, height, cellSize, ledSize) {

  const frgndCanvas = document.getElementById(frgndCanvasId);
  const bkgndCanvas = document.getElementById(bkgndCanvasId);

  frgndCanvas.width = width;
  frgndCanvas.height = height;

  bkgndCanvas.width = width;
  bkgndCanvas.height = height;

  const frgnd_ctx = frgndCanvas.getContext('2d');
  const bkgnd_ctx = bkgndCanvas.getContext('2d');

  var grad = bkgnd_ctx.createLinearGradient(0, 0, width*0.9, height*0.9);
  
  bkgnd_ctx.fillStyle = gradient;

  drawRoundedRectangle(bkgnd_ctx, 0, 0, width, height, 10);

  frgnd_ctx.fillStyle = 'black';

  for (var x = 0; x < width; x += cellSize) {
    frgnd_ctx.fillRect(0, x, width, cellSize - ledSize);
    frgnd_ctx.fillRect(x, 0, cellSize - ledSize, height);
  }
}

var modeScreen = document.querySelector('#modeScreen');
var modeScreenWidth = modeScreen.offsetWidth;
var modeScreenHeight = modeScreen.offsetHeight;

bkgndAndLed('frgndModeCanvas', 'bkgndModeCanvas', modeScreenWidth, modeScreenHeight, cellSize, ledSize);
bkgndAndLed('frgndKeyCanvas', 'bkgndKeyCanvas', modeScreenWidth, modeScreenHeight, cellSize, ledSize);