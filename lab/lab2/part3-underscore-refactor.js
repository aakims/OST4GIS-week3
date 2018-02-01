/*jshint esversion: 6 */

(function(){

  var map = L.map('map', {
    center: [39.9522, -75.1639],
    zoom: 14
  });
  var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map);

  /* =====================

  # Lab 2, Part 4 — (Optional, stretch goal)

  ## Introduction

    You've already seen this file organized and refactored. In this lab, you will
    try to refactor this code to be cleaner and clearer - you should use the
    utilities and functions provided by underscore.js. Eliminate loops where possible.

  ===================== */

  // Mock user input
  // Filter out according to these zip codes:
  var acceptedZipcodes = [19106, 19107, 19124, 19111, 19118];
  // Filter according to enrollment that is greater than this variable:
  var minEnrollment = 300;


  // CLEAN DATA //

  // 1. Clean string type (i.e. xxxxx - xxxx) zip codes

  var cleanZipcodes = function (schoolObj) {
    schoolObj.ZIPCODE = (_.isString(schoolObj.ZIPCODE) ? Number(schoolObj.ZIPCODE.substr(0,5)) : schoolObj.ZIPCODE);
  };
  // TODO: zipcode as ID
  // this function will edit the value to a string rather than number.
  // wouldn't that be what we want anyway? since we don't want to treat zipcode as numerical values?

  // function check
  //console.log(_.each(schools, cleanZipcodes));

  // 2. Clarify school's grade levels by creating four new fields
  // HAS_KINDERGARTEN, HAS_ELEMENTARY, HAS_MIDDLE_SCHOOL, HAS_HIGH_SCHOOL

  // 2.1. withinGradeRange(num, minNum, maxNum):
  // to account for data entry errors when GRADE_ORG is number
  // should be string with correct input

  var withinGradeRange = function(num, minNum, maxNum) {
    if (_.contains(_.range(minNum, maxNum), num)) {
      return true;
    } else {
      return false;
    }
  };

  //testing function
  //console.log(withinGradeRange(4, 1, 6));
  //console.log(withinGradeRange(0, 1, 6));


  // 2.2 doesInclude(strInput, substring):
  var doesInclude = function(strInput, substring) {
    if (strInput.toUpperCase().indexOf(substring) >= 0) {
      return true;
    } else {
      return false;
    }
  };

  // 2.3 cleanGradeLevel(schoolObj):
  var cleanGradeLevel = function(schoolObj) {
    if (_.isNumber(schoolObj.GRADE_LEVEL)) {
      schoolObj.HAS_KINDERGARTEN = withinGradeRange(schoolObj.GRADE_LEVEL, 0, 1); schoolObj.HAS_ELEMENTARY =  withinGradeRange(schoolObj.GRADE_LEVEL, 1, 6); schoolObj.HAS_MIDDLE_SCHOOL = withinGradeRange(schoolObj.GRADE_LEVEL, 6, 9); schoolObj.HAS_HIGH_SCHOOL = withinGradeRange(schoolObj.GRADE_LEVEL, 9, 13);
    } else {
      schoolObj.HAS_KINDERGARTEN = doesInclude(schoolObj.GRADE_LEVEL, 'K'); schoolObj.HAS_ELEMENTARY = doesInclude(schoolObj.GRADE_LEVEL, 'ELE'); schoolObj.HAS_MIDDLE_SCHOOL = doesInclude(schoolObj.GRADE_LEVEL, 'MID'); schoolObj.HAS_HIGH_SCHOOL = doesInclude(schoolObj.GRADE_LEVEL, 'HIGH');
    }
  };

  // run functions 1 and 2 to clean data:
  _.each(schools, cleanZipcodes);
  _.each(schools, cleanGradeLevel);


  // FILTER DATA //

  // filtering conditions
  var isitOpen = function (schoolObj) {
    schoolObj.isOpen = schoolObj.ACTIVE.toUpperCase() === 'OPEN';
  };

  var isitPublic = function (schoolObj) {
    schoolObj.isPublic = (schoolObj.TYPE.toUpperCase() !== 'CHARTER' ||
                          schoolObj.TYPE.toUpperCase() !== 'PRIVATE');
  };

  var isitSchool = function (schoolObj) {
    schoolObj.isSchool = (schoolObj.HAS_KINDERGARTEN ||
                          schoolObj.HAS_ELEMENTARY ||
                          schoolObj.HAS_MIDDLE_SCHOOL ||
                          schoolObj.HAS_HIGH_SCHOOL);
  };

  var meetsMinimumEnrollment = function (schoolObj) {
    schoolObj.meetsMinimumEnrollment = schoolObj.ENROLLMENT > minEnrollment;
  };

  var meetsZipCondition = function (schoolObj) {
    if (_.contains(acceptedZipcodes, schoolObj.ZIPCODE)) {
      return false;
    } else return true;
  };

  var assignFilterCond = function (data, filterFunction) {
    _.each(data, filterFunction);
  };

  assignFilterCond(schools, isitOpen);
  assignFilterCond(schools, isitPublic);
  assignFilterCond(schools, isitSchool);
  assignFilterCond(schools, meetsMinimumEnrollment);
  //TODO: how do I chain some of these together?

  //filter check
  //console.log(schools_[4]); // yes

  var applyAllFilters = function (schoolObj) {
    return schoolObj.isOpen &&
      schoolObj.isSchool &&
      schoolObj.meetsMinimumEnrollment &&
      meetsZipCondition(schoolObj);
  };  // what would !meetsZipCondition(schoolObj) do?


  var filtered_data = _.filter(schools, applyAllFilters);
  var filtered_out = _.difference(schools, filtered_data);

  console.log('Included', filtered_data.length);  //273
  console.log('Excluded:', filtered_out.length);  //277

  // MAIN LOOP // 
/*
  //styling options
  var colorStyle = {HAS_HIGH_SCHOOL: '#0000FF', HAS_MIDDLE_SCHOOL: '#00FF00', theRest: '##FF0000'};
  var color, circRadius;
  var generatePathOpts = function (schoolObj) {

    if (schoolObj['_.keys(colorStyle)[0]']) {
      color = _.propertyOf(_.keys(colorStyle)[0])(colorStyle);
    } else if (schoolObj['_.keys(colorStyle)[1]']) {
      color = _.propertyOf(_.keys(colorStyle)[1])(colorStyle);
    } else {
      color = _.propertyOf(_.keys(colorStyle)[2])(colorStyle);
    }

    //console.log(_.keys(colorStyle)[1]);
    circRadius = schoolObj.ENROLLMENT / 30;

    return {'radius': circRadius, 'fillColor': color};
  };


  var addMarker = function (schoolObj) {
   L.circleMarker([schoolObj.Y, schoolObj.X], generatePathOpts(schoolObj))
    .bindPopup(schoolObj.FACILNAME_LABEL)
    .addTo(map);
  };

  _.each(schools_, addMarker);
*/


  // main loop - original
  //var color;
  for (var i = 0; i < filtered_data.length - 1; i++) {
    isOpen = filtered_data[i].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (filtered_data[i].TYPE.toUpperCase() !== 'CHARTER' ||
                filtered_data[i].TYPE.toUpperCase() !== 'PRIVATE');
    meetsMinimumEnrollment = filtered_data[i].ENROLLMENT > minEnrollment;

    // Constructing the styling  options for our map
    if (filtered_data[i].HAS_HIGH_SCHOOL){
      color = '#0000FF';
    } else if (filtered_data[i].HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    } else {
      color = '##FF0000';
    }
    // The style options
    var pathOpts = {'radius': filtered_data[i].ENROLLMENT / 30,
                    'fillColor': color};
    L.circleMarker([filtered_data[i].Y, filtered_data[i].X], pathOpts)
      .bindPopup(filtered_data[i].FACILNAME_LABEL)
      .addTo(map);
  }


})();
