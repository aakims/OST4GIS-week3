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


  // clean data

  // for two method comparison create two different set of schools dataset
  // probably don't want to just assign another variable bc changes in one will be reflected in the other one as well

  /*****************************************
  refactored: use schools_ dataset
  *****************************************/

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
  //
  var doesInclude = function(strInput, substring) {
    if (strInput.toUpperCase().indexOf(substring) >= 0) {
      return true;
    } else {
      return false;
    }
  };

  // 2.3 cleanGradeLevel():
  var cleanGradeLevel = function(schoolObj) {
    if (_.isNumber(schoolObj.GRADE_LEVEL)) { 
      schoolObj.HAS_KINDERGARTEN = withinGradeRange(schoolObj.GRADE_LEVEL, 0, 1); schoolObj.HAS_ELEMENTARY =  withinGradeRange(schoolObj.GRADE_LEVEL, 1, 6); schoolObj.HAS_MIDDLE_SCHOOL = withinGradeRange(schoolObj.GRADE_LEVEL, 6, 9); schoolObj.HAS_HIGH_SCHOOL = withinGradeRange(schoolObj.GRADE_LEVEL, 9, 13);
    } else {
      schoolObj.HAS_KINDERGARTEN = doesInclude(schoolObj.GRADE_LEVEL, 'K'); schoolObj.HAS_ELEMENTARY = doesInclude(schoolObj.GRADE_LEVEL, 'ELE'); schoolObj.HAS_MIDDLE_SCHOOL = doesInclude(schoolObj.GRADE_LEVEL, 'MID'); schoolObj.HAS_HIGH_SCHOOL = doesInclude(schoolObj.GRADE_LEVEL, 'HIGH');
    }
  };

  // run function 1 and 2 to clean data:
  _.each(schools_, cleanZipcodes);
  _.each(schools_, cleanGradeLevel);


  // filter data
  // has not been refactored; using the given loop-method.
  //var filtered_data_ = [];
  //var filtered_out_ = [];


  // filtering conditions

  /* would something like this useful?
  var isitOrNot = function(schoolObj, filterKey, condition) {
    if (condition) {
      schoolObj.filterKey = true;
    } else schoolObj.filterKey = false;
  };
  */

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

  assignFilterCond(schools_, isitOpen);
  assignFilterCond(schools_, isitPublic);
  assignFilterCond(schools_, isitSchool);
  assignFilterCond(schools_, meetsMinimumEnrollment);
  //TODO: how do I chain some of these together?

  //filter check
  console.log(schools_[4]); // yes

  var masterFilter = function (schoolObj) {
    return schoolObj.isOpen &&
      schoolObj.isSchool &&
      schoolObj.meetsMinimumEnrollment &&
      meetsZipCondition(schoolObj);
  };  // what would !meetsZipCondition(schoolObj) do?


  var filtered_data_ = _.filter(schools_, masterFilter);
  var filtered_out_ = _.difference(schools_, filtered_data_);


/*
  for (var i = 0; i < schools_.length - 1; i++) {
    isOpen = schools_[i].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (schools_[i].TYPE.toUpperCase() !== 'CHARTER' ||
                schools_[i].TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (schools_[i].HAS_KINDERGARTEN ||
                schools_[i].HAS_ELEMENTARY ||
                schools_[i].HAS_MIDDLE_SCHOOL ||
                schools_[i].HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = schools_[i].ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(schools_[i].ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    if (filter_condition) {
      filtered_data_.push(schools_[i]);
    } else {
      filtered_out_.push(schools_[i]);
    }
  }
  */
  console.log('Included by underscore:', filtered_data_.length);
  console.log('Excluded by underscore:', filtered_out_.length);


  /*****************************************
  the given code: data cleaning with a loops
  *****************************************/

  for (var i = 0; i < schools.length - 1; i++) {
    // If we have '19104 - 1234', splitting and taking the first (0th) element
    // as an integer should yield a zip in the format above
    if (typeof schools[i].ZIPCODE === 'string') {
      split = schools[i].ZIPCODE.split(' ');
      normalized_zip = parseInt(split[0]);
      schools[i].ZIPCODE = normalized_zip;
    }

    // Check out the use of typeof here — this was not a contrived example.
    // Someone actually messed up the data entry
    // AK: so here, we are creating HAS_SCHOOLLEVEL keys using GRADE_LEVEL
    if (typeof schools[i].GRADE_ORG === 'number') {  // if number (5 objs)
      schools[i].HAS_KINDERGARTEN = schools[i].GRADE_LEVEL < 1;
      schools[i].HAS_ELEMENTARY = 1 < schools[i].GRADE_LEVEL < 6;
      schools[i].HAS_MIDDLE_SCHOOL = 5 < schools[i].GRADE_LEVEL < 9;
      schools[i].HAS_HIGH_SCHOOL = 8 < schools[i].GRADE_LEVEL < 13;
    } else {  // otherwise (in case of string)
      schools[i].HAS_KINDERGARTEN = schools[i].GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      schools[i].HAS_ELEMENTARY = schools[i].GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      schools[i].HAS_MIDDLE_SCHOOL = schools[i].GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      schools[i].HAS_HIGH_SCHOOL = schools[i].GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  }

  // filter data
  var filtered_data = [];
  var filtered_out = [];
  for (var i = 0; i < schools.length; i++) {
    isOpen = schools[i].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (schools[i].TYPE.toUpperCase() !== 'CHARTER' ||
                schools[i].TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (schools[i].HAS_KINDERGARTEN ||
                schools[i].HAS_ELEMENTARY ||
                schools[i].HAS_MIDDLE_SCHOOL ||
                schools[i].HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = schools[i].ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(schools[i].ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    if (filter_condition) {
      filtered_data.push(schools[i]);
    } else {
      filtered_out.push(schools[i]);
    }
  }
  console.log('Included:', filtered_data.length);
  console.log('Excluded:', filtered_out.length);


  /*****************************************
  running comparison: loop vs. underscore
  *****************************************/
// ref: https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array

  //console.log(filtered_data_);
  console.log(schools.length, schools_.length);

  var inOriginal = filtered_data.map(a => a.OBJECTID);
  var outOfOriginal = filtered_out.map(a => a.OBJECTID);
  var inUnderScore = filtered_data_.map(a => a.OBJECTID);
  var outOfUnderScore = filtered_out_.map(a => a.OBJECTID);

  console.log('included in both methods', _.intersection(inOriginal, inUnderScore), '\n',
              'exclued in both methods', _.intersection(outOfOriginal, outOfUnderScore));

  console.log('Only in original filteredData:', _.difference(inOriginal, inUnderScore), '\n',
              'Only in underscore filteredData:', _.difference(inUnderScore, inOriginal), '\n',
              'Only excluded from original filteredData:', _.difference(outOfOriginal, outOfUnderScore), '\n',
              'Only excluded from underscore filteredData:', _.difference(outOfUnderScore, outOfOriginal), '\n');

  console.log('two methods results are the same: ', _.isEqual(inOriginal, inUnderScore));


/* zipcode debugging check

  //OBJECTID of those that had filtering issue due to zip code string v. number type:
  //  [3, 18, 24, 74, 76, 83, 95, 132, 144, 160, 229, 276]

  console.log(acceptedZipcodes);
  console.log(schools_[0].ZIPCODE);
  //var theZip = Number(schools_[2].ZIPCODE);
  var theZip = schools_[0].ZIPCODE;
  console.log(acceptedZipcodes.indexOf(theZip));
  console.log(_.findWhere(schools, {OBJECTID: 5}),
              _.findWhere(schools_, {OBJECTID: 5}));
*/


  // refactored main loop
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
