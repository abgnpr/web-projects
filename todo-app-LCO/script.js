var newTodoArea = document.getElementById('newTodoInput');
let myUL = document.getElementById('todoList');
let myULs_children = myUL.children;

var addButton = document.getElementById('add');
addButton.addEventListener('click', addItem);

newTodoArea.onkeypress = (k) => {
    let keyCode = k.keyCode || k.which;
    if (keyCode == 13) addItem();
}

var removeButton = document.getElementById('del');
removeButton.addEventListener('click', removeItem);

var removeAllButton = document.getElementById('delall');
removeAllButton.addEventListener('click', removeAllItems);


function addItem() {
    
    if (newTodoArea.value == '') {
        newTodoArea.setAttribute(
            'placeholder', 'Enter your todo!');
        
    } else {

        newTodoArea.setAttribute('placeholder', '');
        
        // grabbing the value from newTodoArea
        var todoTextNode = document.createTextNode(newTodoArea.value);

        // creating new list item
        var newTodoItem = document.createElement('li');
        
        // adding a checkbox to the new list item
        var newTodoCheckbox = document.createElement('input')
        newTodoCheckbox.type = 'checkbox';
        newTodoCheckbox.setAttribute('id', 'check');
        newTodoItem.appendChild(newTodoCheckbox);
        
        // adding a label to the new list item
        var newTodoLabel = document.createElement('label');
        newTodoLabel.setAttribute('for', 'newTodoItem');
        newTodoLabel.appendChild(todoTextNode);
        newTodoItem.appendChild(newTodoLabel);
        
        // inseting the new list item at the beg.
        // of the 'todoList'
        myUL.insertBefore(newTodoItem, myUL.childNodes[0]);
        
        setTimeout(() => {
            newTodoItem.className = 'mycheck';
        }, 50);
    }
    
    newTodoArea.value = '';
    
}

function removeItem() {
    for (let index = 0; index < myULs_children.length; index++)
       while (myULs_children[index] && myULs_children[index].children[0].checked)
           myUL.removeChild(myULs_children[index]);
}

function removeAllItems() {
    while (myULs_children.length > 0)
        myUL.removeChild(myULs_children[myULs_children.length-1]);
}
