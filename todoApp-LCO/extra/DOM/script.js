/* checking  if the script is attached*/
// alert('JS file is attached!');


/**
 * THE DOM
 * DOM - Document Object Model, means 
 *  - a document
 *  - containing objects
 *  - we can design these objects 
 * --------------------------------- 
*/

/* the document is a gigantic object,
 * we can access its various elements,
 * just as we access elements of other
 * objects in js.*/
// console.log(document.body);
// console.log(document.head);
// console.log(document.title);
// console.log(document.documentURI);

/* NOTES: lookup document js MDN
 * --------------------------------- */



// MANIPULATING THE DOM


/* changing title */
// document.title = 'Changed';


/**
 * document.getElementById('string')
 * document.getElementByClassName('string')
 * These can't manipulate the DOM, so 
 * these are not much used.
*/
/* logging an element by its id */
// console.log(document.getElementById('idOne'));

/* logging an element by class */
// console.log(document.getElementsByClassName('classOne'));

/* Errors */
// document.getElementById('idOne') = 'sth';
// document.getElementByClassName('classOne') = 'sth';



/** 
 * .querySelector() and .querySelectorAll()
 * 
 * querySelector() is very eager to select
 * so it always selects the first of the 
 * type specified.
 * 
 * querySelectorAll() selects all of the
 * give type. We can access them using 
 * indices in the order of their occurence
 * in the DOM. */

// const myElement = document.querySelector('p');
// console.log(myElement);

// const myElement = document.querySelectorAll('p');
// console.log(myElement);
// console.log(myElement[0]); // -> first p type element

// const myHeading = document.querySelector('h1');

/* Altering elements using a loop */
// myElement.forEach((p) => {
//     p.textContent = 'I was changed using a loop in js.';
// });

/* Removin an element */
// myHeading.remove();
// myElement.forEach((p) => {
//     p.remove();
// });


/**
 * CREATING A NEW ELEMENT in DOM 
 * .createElement(),
 * .createTextNode(),
 * .appendChild()
 * ----------------------------------*/

/* creating a new heading */
// var myHeading = document.createElement('h2');
// var myHeadingText = document.createTextNode('Hello World.');

// myHeading.appendChild(myHeadingText);
// document.querySelector('body').appendChild(myHeading);


// const myNewPara = document.createElement('p');
// myNewPara.textContent = 'I was added via JS';
// document.querySelector('body').appendChild(myNewPara);

/* NOTES : 
 * Content that's being put on the DOM
 * here doesn't change by the manipulations
 * done above. (top to bottom execution).
 * --------------------------------- */


/**
 * EVENT LISTENERS in JS
 * --------------------------------- */

/* Adding a simple button */

// document.querySelector('button').addEventListener(
//     'click', () => console.log('Button was pressed!')
// );

// document.querySelector('button').addEventListener(
//     'click', (event) => {
//         console.log(event); // a gigantic object
//     }
// );

// document.querySelector('button').addEventListener(
//     'click', (event) => {
//         event.target.textContent = 'I was clicked.';
//     }
// );

/* NOTES : 
 * --------------------------------- */


/** WHERE TO KEEP THE JS FILE
 * depends on where we want to use the 
 * script. Like if we want some script 
 * to be loaded before the the page is 
 * laid, the scipt is placed in the head.
*/
