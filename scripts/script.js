const table = document.getElementById('table');
// Add menu is the menu that we see when we click on button add
const addMenu = document.getElementById('add-menu');

// Add form is the value that we get
const addForm = document.getElementById('add-form');

// The form for editing the values
const editForm = document.getElementById('edit-form');

/* 
  All table rows - The values starts from 1 not from 0 because
  the first cell is Always the time like (7:00AM) and we do not
  want to deal with thoese values
*/
const tableRows = Array.from(document.querySelectorAll('table tr'));

// The item height 100px for all devices
const itemHeight = 100;

// The padding for the item - we need this to make some spaces between top and bottom border
const itemPadding = 10;

// Css classes for item backgrounds color
const itemColors = ['gradient-primary', 'gradient-secondary', 'red-gradient'];

// A variable to hold all the items
let items = [];

// An id that we use as attribute for deleting items
let currentId = 0;

// A variable we use to store the items when the user click on it on table
// So we can do things with it later like delete it or extend it
let selectedItem;

// An IIFE that intalize the values from local storage
(() => {
  let values = JSON.parse(localStorage.getItem('items'));
  if (values) {
    items = values;
  }

  // Adding all items to the table
  items.forEach(ele => convertItemToNewNode(ele));
})();

function getAddString(name, description, hour, extend = 0, id) {
  /* 
    Calculating the height:
    The extend value should always add to it 1 number to we do not get
    0 * the height. And we subtract itemPadding from it so we got a little space between the item and and cell borders
  */
  let height = (extend + 1) * itemHeight;
  height -= itemPadding;

  // Getting a random color
  const color = itemColors[Math.floor(Math.random() * itemColors.length)];

  // We return the value as a template string because there is many variables we need to use
  let result = `<div class="item ${color}" style="height: ${height}px" item-id="${id}">
        <div class="name">${name}</div>`;

  // The description is not required to add An item so we check before we add the item
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
class Item {
  /* 
    This is a class for the items we add. It is just a simple class
    that stores (name, description, day, hour, extendTime) so it will be easier
    to deal with the items
  */
  constructor(name, description, day, hour, extendTime, id) {
    this.name = name;
    this.description = description;
    this.day = day;
    this.hour = hour;
    this.extendTime = extendTime;
    this.id = id;
  }
}

// A function for intalizing all the input vlaues to the nomral values
let emptyAddFromValues = () => {
  addForm.name.value = '';
  addForm.description.value = '';
  addForm.extend.value = 0;
};

// A function that save items array to the local storage
let saveToLocalStorage = () => {
  localStorage.setItem('items', JSON.stringify(items));
};

// A function that add the item to the table and to the array
let addItem = e => {
  e.preventDefault();

  // Increasing the id by one so no element will have the same ID
  currentId++;

  // Getting values
  const newItem = new Item(
    addForm.name.value,
    addForm.description.value,
    addForm.day.value,
    parseInt(addForm.hour.value),
    parseInt(addForm.extend.value),
    currentId
  );

  // Checking if there is no itme in that time
  let availabe = true;
  for (let i = 0; i < items.length; i++) {
    let ele = items[i];
    if (
      ele.day === newItem.day &&
      ((ele.hour <= newItem.hour &&
        ele.hour + ele.extendTime >= newItem.hour) ||
        (ele.hour <= newItem.hour + newItem.extendTime &&
          ele.hour + ele.extendTime >= newItem.hour + newItem.extendTime))
    ) {
      availabe = false;
      alert('There is already a shift in that time');
      break;
    }
  }

  if (!availabe) return;

  // Adding the item to the array and saving it to the local storage
  items.push(newItem);
  saveToLocalStorage();

  // Emptying the values
  emptyAddFromValues();

  // Adding the item to the table
  convertItemToNewNode(newItem);
};

// A function that get the item of type class and add it to the table
function convertItemToNewNode(newItem) {
  const newElement = getAddString(
    newItem.name,
    newItem.description,
    newItem.hour,
    parseInt(newItem.extendTime),
    newItem.id
  );
  // Getting the cell that will contain the new item
  const addCell = tableRows[newItem.hour].children[newItem.day];

  addCell.innerHTML = newElement;
}

// A function for removing items on table click
function selectItem(e) {
  e.stopPropagation();

  let target = e.target;
  if (target.classList.contains('item')) selectedItem = target;
  else if (
    target.classList.contains('name') ||
    target.classList.contains('description')
  )
    selectedItem = target.parentNode;
  else return;

  editForm.style.display = 'block';

  // Adding the values for the edit form so it became easier to edit them
  editForm.editName.value = selectedItem.querySelector('.name').textContent;

  // Checking if there is description
  let description = selectedItem.querySelector('.description');
  if (description) editForm.editDescription.value = description.textContent;

  let extendTime =
    (parseInt(selectedItem.style.height) + itemPadding) / itemHeight - 1;
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
    // We divided by 1.83 because it is too much up and not too much down with the full height and with that it will be on the middle
    yPosition -= editFormHeight - 50;
  }

  editForm.style.top = yPosition + 'px';
  editForm.style.left = xPosition + 'px';
}

function findItem(itemId) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id == itemId) {
      return i;
    }
  }
}

function removeItem() {
  if (confirm('Are you sure??')) {
    let targetID = selectedItem.getAttribute('item-id');
    let targetIndex = -1;

    targetIndex = findItem(targetID);

    if (targetIndex != -1) {
      items.splice(targetIndex, 1);
      saveToLocalStorage();
      selectedItem.remove();
    } else {
      // Just in case
      alert('There is an error!! Item not found!! Please try again');
    }
  }
}

// Events
// Event to add button
document
  .getElementById('add')
  .addEventListener('click', () => (addMenu.style.display = 'flex'));

// Event for cancel button
document.getElementById('cancel-add').addEventListener('click', e => {
  e.preventDefault();
  addMenu.style.display = 'none';

  // Emptying the values
  emptyAddFromValues();
});

// Event for submiting the add form
addForm.addEventListener('submit', addItem);

// Event for removing all shifts
document.getElementById('removeItems').addEventListener('click', () => {
  // Just to be sure it is not a miss click
  if (!confirm('Are you sure')) return;

  items = [];
  saveToLocalStorage();
  Array.from(document.querySelectorAll('.item')).forEach(ele => ele.remove());
});

// We remove items on table click
table.addEventListener('click', selectItem);

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
  removeItem();
});
