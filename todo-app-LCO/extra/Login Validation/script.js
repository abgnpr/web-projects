/* Assignment: Design a form to input
 * username, email, password and repeat
 * password. Check if the passwords
 * entered match or not.
*/
const msg = document.createElement('p');
msg.setAttribute('id', 'msg1');

document
    .querySelector('.myform')
    .addEventListener('submit', (event) => {
        event.preventDefault();
        if (event.target.username.value !== ''
        &&  event.target.email.value !== ''
        &&  event.target.psswd1.value === event.target.psswd2.value
        &&  event.target.psswd1.value !== ''
        &&  event.target.psswd2.value !== '') {
            console.log(event.target.username.value.toUpperCase());
            console.log(event.target.email.value);
            console.log('Passwords match!');
            document.querySelector('.myform').appendChild(msg);
            msg.textContent = 'Done!';
        } else {
            document.querySelector('.myform').appendChild(msg);
            msg.textContent = 'Invalid Input!';
        }
        event.target.username.value = '';
        event.target.email.value = '';
        event.target.psswd1.value = '';
        event.target.psswd2.value = '';
    });

document.querySelector('.myform').addEventListener('input', () => {
    msg.textContent = '';
});

