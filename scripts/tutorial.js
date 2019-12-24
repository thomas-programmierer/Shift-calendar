// An IIFE to see if the tutorial has already been seen
(() => {
  // The tutorial overlay
  const tutorial = document.getElementById('tutorial');

  // The finish button on the totrial
  const finishButton = document.getElementById('finish-tutorial');

  finishButton.addEventListener('click', () => {
    localStorage.setItem('tutorial-seen', true);
    tutorial.style.display = 'none';
  });

  if (!localStorage.getItem('tutorial-seen')) tutorial.style.display = "flex";
})();
