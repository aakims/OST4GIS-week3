/*jshint esversion: 6 */

(function() {

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

  var cleanZipcodes = function(schoolObj) {
    schoolObj.ZIPCODE = (_.isString(schoolObj.ZIPCODE) ? Number(schoolObj.ZIPCODE.substr(0, 5)) : schoolObj.ZIPCODE);
  };

  // 2. Clarify school's grade levels by creating four new fields
  // HAS_KINDERGARTEN, HAS_ELEMENTARY, HAS_MIDDLE_SCHOOL, HAS_HIGH_SCHOOL

  // 2.1. withinGradeRange(num, minNum, maxNum):
  // to account for data entry errors when GRADE_LEVEL is a number
  // should be string with correct input

  var withinGradeRange = function(num, minNum, maxNum) {
    if (_.contains(_.range(minNum, maxNum), num)) {
      return true;
    } else {
      return false;
    }
  };

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
      schoolObj.HAS_KINDERGARTEN = withinGradeRange(schoolObj.GRADE_LEVEL, 0, 1);
      schoolObj.HAS_ELEMENTARY = withinGradeRange(schoolObj.GRADE_LEVEL, 1, 6);
      schoolObj.HAS_MIDDLE_SCHOOL = withinGradeRange(schoolObj.GRADE_LEVEL, 6, 9);
      schoolObj.HAS_HIGH_SCHOOL = withinGradeRange(schoolObj.GRADE_LEVEL, 9, 13);
    } else {
      schoolObj.HAS_KINDERGARTEN = doesInclude(schoolObj.GRADE_LEVEL, 'K');
      schoolObj.HAS_ELEMENTARY = doesInclude(schoolObj.GRADE_LEVEL, 'ELE');
      schoolObj.HAS_MIDDLE_SCHOOL = doesInclude(schoolObj.GRADE_LEVEL, 'MID');
      schoolObj.HAS_HIGH_SCHOOL = doesInclude(schoolObj.GRADE_LEVEL, 'HIGH');
    }
  };

  // run functions 1 and 2 to clean data:
  _.each(schools, cleanZipcodes);
  _.each(schools, cleanGradeLevel);


  // FILTER DATA //

  // filtering conditions
  var isitOpen = function(schoolObj) {
      schoolObj.isOpen = schoolObj.ACTIVE.toUpperCase() === 'OPEN';
    },
    isitPublic = function(schoolObj) {
      schoolObj.isPublic = (schoolObj.TYPE.toUpperCase() !== 'CHARTER' ||
        schoolObj.TYPE.toUpperCase() !== 'PRIVATE');
    },
    isitSchool = function(schoolObj) {
      schoolObj.isSchool = (schoolObj.HAS_KINDERGARTEN ||
        schoolObj.HAS_ELEMENTARY ||
        schoolObj.HAS_MIDDLE_SCHOOL ||
        schoolObj.HAS_HIGH_SCHOOL);
    },
    meetsMinimumEnrollment = function(schoolObj) {
      schoolObj.meetsMinimumEnrollment = schoolObj.ENROLLMENT > minEnrollment;
    },
    meetsZipCondition = function(schoolObj) {
      if (_.contains(acceptedZipcodes, schoolObj.ZIPCODE)) {
        return false;
      } else return true;
    };

  // function to operationalize filter conditions above
  var assignFilterCond = function(data, filterFunction) {
    _.each(data, filterFunction);
  };

  assignFilterCond(schools, isitOpen);
  assignFilterCond(schools, isitPublic);
  assignFilterCond(schools, isitSchool);
  assignFilterCond(schools, meetsMinimumEnrollment);

  var applyAllFilters = function(schoolObj) {
    return schoolObj.isOpen &&
      schoolObj.isSchool &&
      schoolObj.meetsMinimumEnrollment &&
      meetsZipCondition(schoolObj);
  }; // what would !meetsZipCondition(schoolObj) do?

  var filtered_data = _.filter(schools, applyAllFilters);
  var filtered_out = _.reject(schools, applyAllFilters);

  console.log('Included:', filtered_data.length, '\n', //273
    'Excluded:', filtered_out.length, '\n', //277
    'No missing data: ', schools.length === filtered_data.length + filtered_out.length);

  //console.log('Example object: ', filtered_data[100]);


  // LETS MAP //

  //create map objects
  var map = L.map('map', {
    center: [39.9680, -75.1606],
    zoom: 13
  });

  var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map);

  // setting marker styles
  var pathRadius = function(schoolObj) {
      var currentZoom = map.getZoom();
      return (3*(schoolObj.ENROLLMENT/(currentZoom*currentZoom)));
    },
    pathColor = function(schoolObj) {
      if (schoolObj.HAS_HIGH_SCHOOL) {
        return '#0000FF';
      } else if (schoolObj.HAS_MIDDLE_SCHOOL) {
        return '#00ff00';
      } else {
        return '#FF0000';
      }
    },
    markerOptions = function(schoolObj) {
      return {
        radius: pathRadius(schoolObj),
        fillColor: pathColor(schoolObj)
      };
    },
    makeMarkers = function(schoolObj) {
      return L.circleMarker([schoolObj.Y, schoolObj.X],
          markerOptions(schoolObj))
        .bindPopup(schoolObj.FACILNAME_LABEL);
    };

  var groupMarkers = L.layerGroup();
  // reference: https://codepen.io/gvenech/pen/QEjEGg

  // plugging in filtered_data of schools
  _.each(filtered_data, function(schoolObj) {

    var schoolMarker = makeMarkers(schoolObj);

    groupMarkers.addLayer(schoolMarker);

  });

  groupMarkers.addTo(map);

})();
