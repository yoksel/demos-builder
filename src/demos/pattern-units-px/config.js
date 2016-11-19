"use strict";

var $ = tinyLib;

var config = {
  demoContentLayout: 'both-ranges',
  targetElem: $.get( '#pattern' ),

  inputs: {
    ranges: {
      targetElem: $.get('#pattern'),
      isTied: true,
      // units: '%',

      attrs: {
        type: 'range',
        min: 0,
        max: 300,
        step: 1,
        value: 150,
      },

      list: [
        {
          id: 'hor',
          valName: 'width'
        },
        {
          id: 'vert',
          valName: 'height'
        }
      ]
    },

    buttons: {
      prop: 'patternUnits',
      list: [ 'objectBoundingBox', 'userSpaceOnUse' ],
      default: 'userSpaceOnUse',
      current: null,
      currentClass: 'button--current',
      // switchUnits: true
    }
  }
};

demosBuilder.create();