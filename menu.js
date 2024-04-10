const toggleButton = document.getElementById('toggleMidiMenu');
const menu = document.querySelector('.midiSelector');

toggleButton.addEventListener('click', function() {
    if (menu.classList.contains('active')) {
    toggleButton.textContent = 'close midi I/O selector';
  } else {
    toggleButton.textContent = 'select midi I/O';
  }
     menu.classList.toggle('active');
  }
);
