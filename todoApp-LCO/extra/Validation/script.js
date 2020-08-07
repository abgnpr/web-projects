/* Validation using .getElementById() */
// const myValidation = () => {
//     let myValue = document.getElementById('myform').value;
//     if (isNaN(myValue) || myValue < 1 || myValue > 20) {
//         console.log('Invalid Input!');
//     } else {
//         console.log('Cool!');
//     }
// };

/* Validation using .querySelector() */
// const myValidation = () => {
//     var myValue = document.querySelector('#myform').value;
//     if (isNaN(myValue) || myValue < 1 || myValue > 20) {
//         console.log('Invalid Input!');
//     } else {
//         console.log('Cool!');
//     }
// };


/* MY VALIDATIONS */

// document
//     .getElementById('myform')
//     .addEventListener(
//         'change', (event) => {
//             let myValue = event.target.value;
//             if (isNaN(myValue) || myValue < 1 || myValue > 20) {
//                 console.log('Invalid Input!');
//             } else {
//                 console.log('Cool!');
//             }         
//         }
//     );

let valMessage = document.getElementById('valMsg');
document
    .getElementById('myform')
    .addEventListener('input', (event) => {
        let myValue = event.target.value;
        if (isNaN(myValue) || myValue < 1 || myValue > 20) {
            valMessage.textContent = 'Invalid Input!';
        } else {
            valMessage.textContent = 'Cool!';
        }
    });
