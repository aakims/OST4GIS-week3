/* =====================
# Lab 1, Part 2 — Functions as Values
Functions can be passed as values to other functions. Each exercise here builds on that theme.
===================== */

/* =====================
Instructions: Write a function that *always* returns the number 1.
===================== */

var justOne = function() {return 1;};

console.log('justOne success:', justOne() === 1);

/* =====================
Instructions: Write a function that returns true if a number is even.
===================== */

var isEven = function(num) {return num % 2 === 0;};

console.log('isEven success:', isEven(2) === true && isEven(3) === false);

/* =====================
Instructions: Write a function that *always* returns false.
              Use functions "justOne" and "isEven" somehow in the definition.
===================== */

var justFalse = function() {return isEven(justOne);};

console.log('justFalse success:', justFalse() === false);

/* =====================
Instructions: Write a function that takes a boolean value and returns its opposite.
===================== */

var not = function(TorF) {
  return TorF !== true;
};

console.log('not success:', not(true) === false);

/* =====================
Instructions: Write a function that returns true if a number is odd
              Use functions "isEven" and "not" somehow in the definition.
===================== */

var isOdd = function(num) {return not(isEven(num));};

console.log('isOdd success:', isOdd(4) === false);

/* =====================
Instructions: Write a function that takes a list of numbers and returns a list with only numbers above 10
===================== */

var filterOutLessThan10 = function(Arr) {
  var resultArr = [];
  for (var numIndex = 0; numIndex < Arr.length; numIndex++) {
    if (Arr[numIndex] > 10) {
      resultArr.push(Arr[numIndex]);
    }
  }
  return resultArr;
};

// using underscore.js
var filterOutLessThan10With_= function(arr) {
  return _.filter(arr, function(num) {return num > 10;});
};

//TODO: array equality + return boolean + when break?
/* this version returns true for
compareNumArrays([1,2,3],[1,2,7]) why?

var compareNumArrays = function (Arr1, Arr2) {
  if (Arr1.length != Arr2.length) {
    return false;
  }
  else {
    for (numIndex = 0; numIndex < Arr1.length; numIndex++) {
      if (Arr1[numIndex] !== Arr2[numIndex]) {
        return false;
      }
      else return true;
    }
  }
};
*/

var compareNumArrays = function (Arr1, Arr2) {
  var falseCount = 0;
  if (Arr1.length != Arr2.length) {
    return false;
  }
  else {
    for (numIndex = 0; numIndex < Arr1.length; numIndex++) {
      if (Arr1[numIndex] != Arr2[numIndex]) {
        falseCount = falseCount + 1; // would rather not use this method
      }
    }
  }
  if (falseCount > 0) {return false;} else return true;
};

console.log('filterOutLessThan10 success:', compareNumArrays(filterOutLessThan10([4, 11]), [11]));
console.log('filterOutLessThan10 (w/ _.) success:', _.isEqual(filterOutLessThan10With_([4,11]),[11]));


/* =====================
Stretch goal
Instructions: Let's bring it all together. Write a function that filters a list with a predicate you provide. It takes:
              1. a list of values (to be filtered)
              2. a function that takes a value and returns true (to keep a number) or false (to toss it out)
===================== */

var filter = function(array, func) {
  var resultArray = [];
  for (var numIndex = 0; numIndex < array.length; numIndex++) {
    if (func(array[numIndex]) === true) {
      resultArray.push(array[numIndex]);
    }
  }
  return resultArray;
};

console.log('filter success:', compareNumArrays(filter([4, 11], isOdd),[11]));
console.log('_.filter success:', _.isEqual(_.filter([4,11], isOdd), [11]));
