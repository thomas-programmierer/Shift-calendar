// Add menu is the menu that we see when we click on button add
const addMenu = document.getElementById('add-menu');

// Add form is the value that we get
const addForm = document.getElementById('add-form');

/* 
  All table rows - The values starts from 1 not from 0 because
  the first cell is Always the time like (7:00AM) and we do not
  want to deal with thoese values
*/
const tableRows = Array.from(document.querySelectorAll('table tr'));

// The item height 100px for all devices
const itemHeight = 100;

// Css classes for item backgrounds color
const itemColors = ['gradient-primary', 'gradient-secondary'];

// A variable to hold all the items
let items = [];

let currentId = 0;

// An IIFE that intalize the values from local storage

(() => {
  let values = JSON.parse(localStorage.getItem('items'));
  if (values) {
    items = values;
  }

  // Adding all items to the table
  items.forEach(ele => convertItemToNewNode(ele));
})();

function getAddString(name, description, extend = 0) {
  /* 
    Calculating the height:
    The extend value should always add to it 1 number to we do not get
    0 * the height. And we subtract 10 from it so we got a little space between the item and and cell borders
  */
  let height = (extend + 1) * itemHeight;
  height -= 10;

  // Getting a random color
  const color = itemColors[Math.floor(Math.random() * itemColors.length)];

  // We return the value as a template string because there is many variables we need to use
  let result = `<div class="item ${color}" style="height: ${height}px">
        <div class="name">${name}</div>`;

  // The description is not required to add An item so we check before we add the item
  if (description) result += `<div class="description">${description}</div>`;

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
    addForm.hour.value,
    addForm.extend.value,
    currentId
  );

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
    parseInt(newItem.extendTime)
  );
  // Getting the cell that will contain the new item
  const addCell = tableRows[newItem.hour].children[newItem.day];

  addCell.innerHTML = newElement;
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
document.getElementById('add-item').addEventListener('click', addItem);

// Event for removing all shifts
document.getElementById('removeItems').addEventListener('click', () => {
  // Just to be sure it is not a miss click
  if (!confirm('Are you sure')) return;

  items = [];
  saveToLocalStorage();
  Array.from(document.querySelectorAll('.item')).forEach(ele => ele.remove());
});
