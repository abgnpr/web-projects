/* illustrates: properties, methods, properties,
 * scope problem and 'this'. */

// an object
let todo = {

    // properties or elements, states
    day: 'Monday',
    nM:  0,
    nMD: 0,
  
    /* function inside objects are called methods!*/
  
    // a method (behaviour)
    addToMeetings: function(num = 1) {
        this.nM += num;
    },
  
    // another method (behaviour)
    increaseMeetsDone: (num = 1) => {
        this.nMD += num;
    },
  
    /* NOTE: fat arrow doesn't work, 
   * unable to modify nMD using the this
   * keyword when we use such function 
   * expressions */

    // increaseMeetsDone: (num = 1) => {
    //   this.nMD += num;
    // },
  
    // yet another method (behaviour)
    summary: function() {
        return `You have ${this.nM-this.nMD} meetings left`;
    }

};

todo.addToMeetings(25);
todo.increaseMeetsDone(5);
console.log(todo.summary());
