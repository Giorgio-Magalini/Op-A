var opAmodel = {
  tombola: {
    aperture: {
      value: 0,
      min: -1,
      max: 1,
    },
    rotation_speed: {
      value: 0,
      min: -0.1,
      max: 0.1,
    },
    gravity: {
      value: 0,
      min: 0,
      max: 0.5,
    },
  },
  knobs: {
    aperture: {
      element: document.getElementById("aperture"),
      min: 0,
      max: 100,
      value: 50,
    },
    rotation_speed: {
      element: document.getElementById("rotation_speed"),
      min: 0,
      max: 100,
      value: 50,
    },
    gravity: {
      element: document.getElementById("gravity"),
      min: 0,
      max: 100,
      value: 50,
    },
  },
};
function setupKnobs() {
  const knobs = document.querySelectorAll(".knob");

  knobs.forEach((knob) => {
    let angleValue = 0,
      angleAtMouseUp = 0,
      yAtClick = 0,
      xAtClick = 0,
      isDragging = false,
      timeoutID;

    const maxAngle = 180,
      minAngle = -180,
      variableName = knob.id;

    knob.addEventListener("mousedown", handleMouseDown);
    knob.addEventListener("touchstart", handleTouchStart);
    knob.addEventListener("touchmove", handleTouchMove, { passive: true });
    knob.addEventListener("touchend", handleTouchEnd);
    knob.addEventListener("dblclick", initializeKnob);
    knob.addEventListener("wheel", handleWheel, { passive: true });

    document.addEventListener("DOMContentLoaded", initializeKnob);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    function updateKnobValue(newValue) {
      opAmodel.knobs[variableName].value = newValue;
      opAmodel.tombola.aperture.value =
        mapToRange(opAmodel.knobs.aperture.value, 0, 100, -1, 1) || 0;
      opAmodel.tombola.rotation_speed.value =
        mapToRange(opAmodel.knobs.rotation_speed.value, 0, 100, -0.1, 0.1) || 0;
      opAmodel.tombola.gravity.value =
        mapToRange(opAmodel.knobs.gravity.value, 0, 100, 0, 0.5) || 0;
    }

    function initializeKnob() {
      angleValue = 0;
      angleAtMouseUp = 0;
      updateKnob(0, knob);
    }

    function handleMouseDown(event) {
      isDragging = true;
      knob.classList.add("active");
      yAtClick = event.clientY;
      xAtClick = event.clientX;
      angleValue = getKnobDeltaY(event.clientY, knob);
      updateKnob(angleValue, knob);
    }

    function handleTouchStart(event) {
      isDragging = true;
      knob.classList.add("active");
      angleValue = getKnobDeltaY(event.touches[0].clientY, knob);
      updateKnob(angleValue, knob);
    }

    function handleTouchMove(event) {
      if (isDragging) {
        angleValue = getKnobDeltaY(event.touches[0].clientY, knob);
        updateKnob(angleValue, knob);
      }
    }

    function handleTouchEnd() {
      isDragging = false;
      knob.classList.remove("active");
      angleAtMouseUp = angleValue;
    }

    function handleWheel(event) {
      knob.classList.add("active");
      clearTimeout(timeoutID);
      timeoutID = setTimeout(() => knob.classList.remove("active"), 100);
      angleValue += event.deltaY;
      angleValue = limitAngle(angleValue);
      angleAtMouseUp = angleValue;
      updateKnob(angleValue, knob);
    }

    function handleMouseMove(event) {
      if (isDragging) {
        angleValue = getKnobDeltaY(event.clientY, knob);
        updateKnob(angleValue, knob);
      }
    }

    function handleMouseUp() {
      isDragging = false;
      knob.classList.remove("active");
      angleAtMouseUp = angleValue;
    }

    function updateKnob(angle, knob) {
      knob.updateValue = updateKnobValue;
      knob.updateValue(mapToRange(angle, minAngle, maxAngle, 0, 100));
      knob.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      const progressBarInfo = getProgressBarTransformations(knob, angle);
      const svgProgressBar = knob.parentNode.querySelector(".progBarPath");
      svgProgressBar.style.strokeDashoffset = progressBarInfo.offset;
      svgProgressBar.style.strokeDasharray = `${progressBarInfo.dashLength} ${
        progressBarInfo.lengthProgBar - progressBarInfo.dashLength
      }`;
    }

    function getProgressBarTransformations(knob, angle) {
      const svgProgressBar = knob.parentNode.querySelector(".progBarPath");
      const lengthProgBar = svgProgressBar.getTotalLength();
      let angleOffset, dashLength;
      if (knob.classList.contains("hasNegativeRotation")) {
        angleOffset = 0;
        let offset =
          lengthProgBar / 2 +
          (angle < 0 ? (lengthProgBar * Math.abs(angle)) / 360 : 0);
        svgProgressBar.style.strokeDashoffset = offset;
        dashLength = (lengthProgBar * (Math.abs(angle) + angleOffset)) / 360;
      } else {
        angleOffset = 180;
        dashLength = (lengthProgBar * (angle + angleOffset)) / 360;
      }
      return {
        offset: svgProgressBar.style.strokeDashoffset,
        dashLength: dashLength,
        lengthProgBar: lengthProgBar,
      };
    }

    function getKnobDeltaY(mouseY, knob) {
      const rect = knob.getBoundingClientRect();
      // const knobCenterX = rect.left + rect.width / 2;
      const deltaY = mouseY - yAtClick;
      // const deltaX = xAtClick - knobCenterX;
      // let angle = deltaX >= 0 ? deltaY : -deltaY;
      let angle = - deltaY;
      return limitAngle(angle + angleAtMouseUp);
    }

    function limitAngle(angle) {
      return Math.min(Math.max(angle, minAngle), maxAngle);
    }

    function mapToRange(value, min, max, newMin, newMax) {
      return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
    }
  });
}

setupKnobs();
