const table = document.getElementById('table');
// Add menu is the menu that we see when we click on button add
const addMenu = document.getElementById('add-menu');

// Add form is the value that we get
const addForm = document.getElementById('add-form');

// The form for editing the values
const editForm = document.getElementById('edit-form');

// The color options in add form
const colorsAddFrom = document.getElementById('colors');
// The class for selected color
const colorsSelectedClass = 'selected';
// The current selected color index, 0 is the default
let colorSelectedIndex = 0;

/* 
  All table rows - The values starts from 1 not from 0 because
  the first cell is Always the time like (7:00AM) and we do not
  want to deal with thoese values
*/
const tableRows = Array.from(document.querySelectorAll('table tr'));

// The shift height 100px for all devices
const shiftHeight = 100;

// The padding for the shift - we need this to make some spaces between top and bottom border
const shiftPadding = 10;

// Css classes for shift backgrounds color
const shiftColors = [
  'gradient-primary',
  'gradient-secondary',
  'red-gradient',
  'green-gradient',
  'purple-gradient'
];

// A variable to hold all the shifts
let shifts = [];

// An id that we use as attribute for deleting shifts
let currentId = 0;

// A variable we use to store the shifts when the user click on it on table
// So we can do things with it later like delete it or extend it
let selectedShift;

// An IIFE that intalize the values from local storage
(() => {
  // Adding colors to add menu first
  shiftColors.forEach((ele, index) => {
    let newElement = document.createElement('div');
    newElement.classList.add(ele);
    if (index === 0) newElement.classList.add(colorsSelectedClass);
    colorsAddFrom.appendChild(newElement);
  });

  let values = JSON.parse(localStorage.getItem('shifts'));
  if (values) {
    shifts = values;
  } else return;

  // Adding all shifts to the table
  shifts.forEach(ele => convertShiftToNewNode(ele));

  /* 
    This line is to stop making the current id start from 0 if there is
    already an shift in that id
  */
  if (shifts.length > 0) currentId = shifts[shifts.length - 1].id;
})();

function getAddString(name, description, hour, extend = 0, id, shiftColor) {
  /* 
    Calculating the height:
    The extend value should always add to it 1 number to we do not get
    0 * the height. And we subtract shiftPadding from it so we got a little space between the shift and and cell borders
  */
  let height = (extend + 1) * shiftHeight;
  height -= shiftPadding;

  // Getting the color
  const color = shiftColor;

  // We return the value as a template string because there is many variables we need to use
  let result = `<div class="shift ${color}" style="height: ${height}px" shift-id="${id}">
        <div class="name">${name}</div>`;

  // The description is not required to add A shift so we check before we add the shift
  if (description) result += `<div class="description">${description}</div>`;

  // Adding the end time for small devices because we can not show many hours at the small devices
  if (extend > 0 && hour + extend < tableRows.length) {
    // Getting the end time from the table cells instead of doing alot of if statements and calculations
    let endTime = tableRows[hour + extend].children[0].textContent;
    result += `<div class="endtime">Ends on ${endTime}</div>`;
  }

  // Closeing the html string
  result += '</div>';
  return result;
}

// Classes
class Shift {
  /* 
    This is a class for the shifts we add. It is just a simple class
    that stores (name, description, day, hour, extendTime) so it will be easier
    to deal with the shifts
  */
  constructor(name, description, day, hour, extendTime, id, shiftColor) {
    this.name = name;
    this.description = description;
    this.day = day;
    this.hour = hour;
    this.extendTime = extendTime;
    this.id = id;
    this.shiftColor = shiftColor;
  }
}

// A function for intalizing all the input vlaues to the nomral values
let emptyAddFromValues = () => {
  addForm.name.value = '';
  addForm.description.value = '';
  addForm.extend.value = 0;
};

// A function that save shifts array to the local storage
let saveToLocalStorage = () => {
  localStorage.setItem('shifts', JSON.stringify(shifts));
};

function shiftExist(newShift) {
  // Checking if there is no itme in that time
  for (let i = 0; i < shifts.length; i++) {
    let ele = shifts[i];
    if (newShift.id == ele.id) continue;
    else if (
      (ele.day === newShift.day &&
        ((ele.hour <= newShift.hour &&
          ele.hour + ele.extendTime >= newShift.hour) ||
          (ele.hour <= newShift.hour + newShift.extendTime &&
            ele.hour + ele.extendTime >= newShift.hour))) ||
      newShift.hour + newShift.extendTime >= tableRows.length
    ) {
      alert(
        'There is already a shift in that time try to change the extend time or the day'
      );
      return true;
    }
  }

  return false;
}

// A function that add the shift to the table and to the array
let addShift = e => {
  e.preventDefault();

  // Getting values
  const newShift = new Shift(
    addForm.name.value,
    addForm.description.value,
    addForm.day.value,
    parseInt(addForm.hour.value),
    parseInt(addForm.extend.value),
    ++currentId,
    shiftColors[colorSelectedIndex]
  );

  if (shiftExist(newShift)) return;

  // Adding the shift to the array and saving it to the local storage
  shifts.push(newShift);
  saveToLocalStorage();

  // Emptying the values
  emptyAddFromValues();

  // Adding the shift to the table
  convertShiftToNewNode(newShift);
};

// A function that get the shift of type class and add it to the table
function convertShiftToNewNode(newShift) {
  const newElement = getAddString(
    newShift.name,
    newShift.description,
    newShift.hour,
    parseInt(newShift.extendTime),
    newShift.id,
    newShift.shiftColor
  );
  // Getting the cell that will contain the new shift
  const addCell = tableRows[newShift.hour].children[newShift.day];

  addCell.innerHTML = newElement;
}

// A function for removing shifts on table click
function selectShift(e) {
  e.stopPropagation();

  /*
    This place of code here checks if the shift that got clicked is a shift
    and then assigning it to selectedShift for future process like deleting the shift
    or chaning its value
  */
  let target = e.target;
  if (target.classList.contains('shift')) selectedShift = target;
  else if (
    target.classList.contains('name') ||
    target.classList.contains('description') ||
    target.classList.contains('endtime')
  )
    selectedShift = target.parentNode;
  else return;

  editForm.style.display = 'block';

  // Adding the values for the edit form so it became easier to edit them
  editForm.editName.value = selectedShift.querySelector('.name').textContent;

  // Checking if there is description
  let description = selectedShift.querySelector('.description');
  if (description) editForm.editDescription.value = description.textContent;
  else editForm.editDescription.value = '';

  let extendTime =
    (parseInt(selectedShift.style.height) + shiftPadding) / shiftHeight - 1;
  editForm.extendTime.value = extendTime;

  // Positing the edit form
  let mouse = {
    x: e.pageX,
    y: e.pageY
  };

  let yPosition = mouse.y;
  let xPosition = mouse.x;

  // Checking if the edit form widow overflowing the browser width
  const editFormWidth = parseInt(editForm.offsetWidth);
  if (mouse.x + editFormWidth > document.body.offsetWidth)
    xPosition -= editFormWidth;

  // Now for y-axe
  const editFormHeight = parseInt(editForm.offsetWidth);
  if (mouse.y + editFormHeight > document.body.offsetHeight) {
    // We added 74px because it is not too much up and not too much down with the full height and with that it will be on the middle
    yPosition -= editFormHeight + 74;
  }

  // Applying the position
  editForm.style.top = yPosition + 'px';
  editForm.style.left = xPosition + 'px';
}

// A function just to find a shift index in the array shifts based on Id
function findShift(shiftId) {
  return shifts.findIndex(ele => shiftId == ele.id);
}

function removeShift() {
  // Checking if it is not a miss click
  if (confirm('Are you sure??')) {
    // Getting the index of the shift that wanted to be deleted
    let targetID = selectedShift.getAttribute('shift-id');
    let targetIndex = -1;
    targetIndex = findShift(targetID);

    // Checking that the shift is found
    if (targetIndex != -1) {
      shifts.splice(targetIndex, 1);
      saveToLocalStorage();
      selectedShift.remove();
    } else {
      // Just in case
      alert('There is an error!! shift not found!! Please try again');
    }
  }
}

// Events
// Event to add button
document.getElementById('add').addEventListener('click', () => {
  // Hiding edit form if it shown and displying the add menu
  editForm.style.display = 'none';
  addMenu.style.display = 'flex';
});

// Event for cancel button
document.getElementById('cancel-add').addEventListener('click', e => {
  e.preventDefault();
  addMenu.style.display = 'none';

  // Emptying the values
  emptyAddFromValues();
});

// Event for submiting the add form
addForm.addEventListener('submit', addShift);

// Event for removing all shifts
document.getElementById('removeShifts').addEventListener('click', () => {
  // Hiding the edit form if it is displayed
  editForm.style.display = 'none';

  // Just to be sure it is not a miss click
  if (!confirm('Are you sure')) return;

  shifts = [];
  saveToLocalStorage();
  Array.from(document.querySelectorAll('.shift')).forEach(ele => ele.remove());
});

// We remove shifts on table click
table.addEventListener('click', selectShift);

// Event for hiding the edit form
document.getElementById('cancel-edit').addEventListener('click', e => {
  e.preventDefault();
  editForm.style.display = 'none';
});

// Event for when clicking on remove on edit form
document.getElementById('delete-shift').addEventListener('click', e => {
  // So it does not go to any link and scroll up to top
  e.preventDefault();
  editForm.style.display = 'none';
  removeShift();
});

editForm.addEventListener('submit', e => {
  e.preventDefault();

  // Finding the shifts
  let selectedShiftId = selectedShift.getAttribute('shift-id');
  let shiftIndex = findShift(selectedShiftId);

  // This is a variable just to check if there is already a shift when the new extending time
  // If there is it will save the new name and description but not the new extend time
  let oldExtendTime = shifts[shiftIndex].extendTime;

  // Changing the value
  shifts[shiftIndex].name = editForm.editName.value;
  shifts[shiftIndex].description = editForm.editDescription.value;
  shifts[shiftIndex].extendTime = parseInt(editForm.extendTime.value);

  if (shiftExist(shifts[shiftIndex])) {
    shifts[shiftIndex].extendTime = oldExtendTime;
    return;
  } else {
    // Removing the shift from the node and hiding the edit form
    selectedShift.remove();
    editForm.style.display = 'none';

    // Showing the new shifts
    convertShiftToNewNode(shifts[shiftIndex]);

    // Saving changes
    saveToLocalStorage();
  }
});

// Events for selecting the color
Array.from(colorsAddFrom.querySelectorAll('div')).forEach((ele, index) => {
  ele.addEventListener('click', () => {
    // First removing the old selected shift
    colorsAddFrom
      .querySelectorAll('div')
      [colorSelectedIndex].classList.remove(colorsSelectedClass);

    // And regestring the new index for future processing
    colorSelectedIndex = index;
    ele.classList.add(colorsSelectedClass);
  });
});
