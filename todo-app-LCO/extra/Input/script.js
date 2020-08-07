// track input form
document.querySelector('#myform').addEventListener(
    'change', (event)=> console.log(event.target.value)
);

// the one being used on google.com
document.querySelector('#myform').addEventListener(
    'input', (event)=> console.log(event.target.value)
);

