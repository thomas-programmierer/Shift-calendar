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

// Add popup element
const addPopup = document.getElementById('add-pop-up');

// Add popup row and column - We use it for intalizng the values for add form
let addPopupCol, addPopupRow;

// An IIFE that intalize the values from local storage
(() => {
  // Adding colors to add menu first
  shiftColors.forEach((ele, index) => {
    const newElement = document.createElement('div');
    newElement.classList.add(ele);
    if (index === 0) newElement.classList.add(colorsSelectedClass);
    colorsAddFrom.appendChild(newElement);
  });

  const values = JSON.parse(localStorage.getItem('shifts'));
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
    const endTime = tableRows[hour + extend].children[0].textContent;
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
const emptyAddFromValues = () => {
  addForm.name.value = '';
  addForm.description.value = '';
  addForm.extend.value = 0;
};

// A function that save shifts array to the local storage
const saveToLocalStorage = () => {
  localStorage.setItem('shifts', JSON.stringify(shifts));
};

function shiftExist(newShift) {
  // Checking if there is no itme in that time
  for (let i = 0; i < shifts.length; i++) {
    const ele = shifts[i];
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
const addShift = e => {
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

  showEditForm();

  // Adding the values for the edit form so it became easier to edit them
  editForm.editName.value = selectedShift.querySelector('.name').textContent;

  // Checking if there is description
  const description = selectedShift.querySelector('.description');
  if (description) editForm.editDescription.value = description.textContent;
  else editForm.editDescription.value = '';

  const extendTime =
    (parseInt(selectedShift.style.height) + shiftPadding) / shiftHeight - 1;
  editForm.extendTime.value = extendTime;

  // Positing the edit form
  const mouse = {
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
function findShiftIndex(shiftId) {
  return shifts.findIndex(ele => shiftId == ele.id);
}

// An array to find the item with binary search algorithm
function binarySearch(shiftId, arr = shifts) {
  if (arr.length === 0) return;

  const middlePoint = Math.floor(arr.length / 2);
  if (arr[middlePoint].id == shiftId) return arr[middlePoint];
  else if (arr[middlePoint].id > shiftId)
    return binarySearch(shiftId, arr.slice(0, middlePoint));
  else return binarySearch(shiftId, arr.slice(middlePoint));
}

function removeShift() {
  // Checking if it is not a miss click
  if (confirm('Are you sure??')) {
    // Getting the index of the shift that wanted to be deleted
    const targetID = selectedShift.getAttribute('shift-id');
    const targetIndex = findShiftIndex(targetID);

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

// functions for hiding things (preferred to use)
const hideEditForm = () => {
  editForm.style.display = 'none';
};

const hideAddMenu = () => {
  addMenu.style.display = 'none';
};

const hideAddPopup = () => {
  addPopup.style.display = 'none';
};

const hideAllPopups = () => {
  hideEditForm();
  hideAddPopup();
};

/*
  functions for showing things (preferred to use)
  The function does hide the other pop ups
*/

const showAddPopup = () => {
  addPopup.style.display = 'block';
  hideEditForm();
};

const showEditForm = () => {
  editForm.style.display = 'block';
  hideAddPopup();
};

const showAddMenu = () => {
  addMenu.style.display = 'flex';
  hideAllPopups();
};

// Events
// Event to add button
document.getElementById('add').addEventListener('click', () => {
  // Hiding edit form if it shown and displying the add menu
  showAddMenu();
});

// Event for cancel button
document.getElementById('cancel-add').addEventListener('click', e => {
  e.preventDefault();
  hideAddMenu();

  // Emptying the values
  emptyAddFromValues();
});

// Event for submiting the add form
addForm.addEventListener('submit', addShift);

// Event for removing all shifts
document.getElementById('removeShifts').addEventListener('click', () => {
  // Hiding the edit form if it is displayed
  hideAllPopups();

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
  hideEditForm();
});

// Event for when clicking on remove on edit form
document.getElementById('delete-shift').addEventListener('click', e => {
  // So it does not go to any link and scroll up to top
  e.preventDefault();
  hideEditForm();
  removeShift();
});

editForm.addEventListener('submit', e => {
  e.preventDefault();

  // Finding the shifts
  const selectedShiftId = selectedShift.getAttribute('shift-id');
  const shiftTarget = binarySearch(selectedShiftId);

  // This is a variable just to check if there is already a shift when the new extending time
  // If there is it will save the new name and description but not the new extend time
  const oldExtendTime = shiftTarget.extendTime;

  // Changing the value
  shiftTarget.name = editForm.editName.value;
  shiftTarget.description = editForm.editDescription.value;
  shiftTarget.extendTime = parseInt(editForm.extendTime.value);

  if (shiftExist(shiftTarget)) {
    shiftTarget.extendTime = oldExtendTime;
    return;
  } else {
    // Removing the shift from the node and hiding the edit form
    selectedShift.remove();
    hideEditForm();

    // Showing the new shifts
    convertShiftToNewNode(shiftTarget);

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

// Events for adding items from table
// I loop over the whole table just for the index of the element
Array.from(document.querySelectorAll('tr')).forEach((tr, trIndex) => {
  Array.from(tr.querySelectorAll('td')).forEach((td, tdIndex) => {
    // The index at 0 is the time
    if (tdIndex === 0) return;
    td.addEventListener('click', e => {
      // Checking for tag name
      if (e.target.tagName.toLowerCase() === 'td') {
        // Hiding the edit form and stopping propagation
        hideEditForm();
        e.stopPropagation();
      } else return;

      // Show the add pop up and styling the position
      showAddPopup();
      let yPosition = e.pageY;
      let xPosition = e.pageX;

      // Checking for overflow for the borwser
      // Checking if the edit form widow overflowing the browser width
      const addPopUpWidth = parseInt(addPopup.offsetWidth);
      if (xPosition + addPopUpWidth > document.body.offsetWidth)
        xPosition -= addPopUpWidth;

      // Now for y-axe
      const addPopupHeight = parseInt(addPopup.offsetHeight);
      if (yPosition + addPopupHeight > document.body.offsetHeight) {
        yPosition -= 50;
      }

      // Applying the position
      addPopup.style.top = yPosition + 'px';
      addPopup.style.left = xPosition + 'px';

      // Intalinzing the values
      addPopupRow = trIndex;
      addPopupCol = tdIndex;
    });
  });
});

// Adding event for add-popup add button
document.getElementById('show-add-menu').addEventListener('click', () => {
  // Showing the add menu
  showAddMenu();

  // Intalinzing the values
  addForm.day.value = addPopupCol;
  addForm.hour.value = addPopupRow;
});

// An event for hiding the add pop up
document
  .getElementById('cancel-add-popup')
  .addEventListener('click', hideAddPopup);
