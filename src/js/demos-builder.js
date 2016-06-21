(function( window ) {

  'use strict';

  function define_library () {

    var demosBuilder = {};
    var demo;
    var demoContent;
    var ranges;
    var rangesHolder;

    var buttons;
    var buttonsHolder;

    //------------------------------

    function Range ( i ) {

      var item = ranges.list[i];
      var prefix = 'range--' + item.id;
      this.item = item;
      this.valName = item.valName;
      this.units = ranges.units || '';
      this.transform = this.item.transform;
      this.targetElem = ranges.targetElem || config.targetElem;

      var rangeHolder = $.create( 'div' )
                         .addClass( ['range', 'range--' + item.id ] );

      this.title = $.create( 'div' )
                    .addClass( ['range__title'] );

      this.input = $.create( 'input' )
                    .attr( ranges.attrs )
                    .addClass( ['range__input']);

      rangeHolder.append( this.title ).append( this.input );
      rangesHolder.append( rangeHolder );

      var that = this;

      this.input.elem.oninput = function () {
        that.setValue();
      };

      return this;
    };

    //------------------------------

    Range.prototype.setValue = function () {
      var value = this.input.elem.value;

      // $.out('setValue', 'h4');

      if ( this.transform ) {
        // $.out('— transform');
        value = this.getTransform();
      }
      else if ( buttons.switchUnits === true ) {
        // convert input units
        // convert target units
        // $.out('— switch values');
        // convertAttrs( this.input );

        value = convertValue( this.input.elem.value );
        // console.log( this.input.elem.value );
      }
      else {
        $.out('— no values processing');
        value += this.units;
      }

      this.targetElem.attr( this.valName, value );
      this.title.html(this.valName + ': ' + value);
    };

    //------------------------------

    Range.prototype.getTransform = function () {
      var value = this.input.elem.value;

      var transformName = this.transform.name;
      var transformSet = [ value ];

      var currentButtonVal = buttons.current.val();

      var transformOrigin = this.transform.origin[ currentButtonVal ];

      if ( transformOrigin ) {
        transformSet = transformSet.concat( transformOrigin );
      }

      value = transformName + '(' + transformSet.join(', ') + ')';

      return value;
    }

    //------------------------------

    function convertAttrs ( elemSet ) {
      var elem = elemSet.elem;
      var attrsList = elem.attributes;

      for (var i = 0; i < attrsList.length; i++) {
        var attrItem = attrsList[i];
        var attrName = attrItem.name;
        var attrValue = +attrItem.value.replace('%','');

        if( !isNaN ( attrValue ) ) {
          attrValue = convertValue ( attrValue );
          elemSet.attr( attrName, attrValue);
        }
      }
    }

    //------------------------------

    function convertValue ( value ) {
      var newValue = 0;
      var currentButtonVal = buttons.current.val();

      //objectBoundingBox
      if ( currentButtonVal ===  'objectBoundingBox') {

        if ( value < 1 ) {
            newValue = value;
        }
        else {
            newValue = value / 100;
        }
      }
      //userSpaceOnUse
      else {
        if ( value <= 1 ) {
            newValue = value * 100;
        }
        else {
            newValue = value;
        }

        newValue += ranges.units;
      }

      return newValue;
    }

    //------------------------------

    function addRanges () {

      ranges.collection = [];

      rangesHolder = $.create('div')
                          .addClass( [ 'controls', 'controls--ranges'] );

      demoContent.prepend( rangesHolder );

      for (var i = 0; i < ranges.list.length; i++) {
        var range = new Range( i );
        range.setValue();
        ranges.collection[ i ] = range;
      }
    }

    //------------------------------

    function resetRangesValues() {

      if ( ranges.targetElem ) {
        convertAttrs( ranges.targetElem );
      }

      for (var i = 0; i < ranges.collection.length; i++) {
        ranges.collection[i].setValue();
      }
    }

    //------------------------------

    function addButtons() {
      buttonsHolder = $.create('div')
                       .addClass( [ 'controls', 'controls--buttons'] );

      demo.prepend( buttonsHolder );

      var buttonsTitle = $.create( 'h2' )
                          .addClass('controls__title' )
                          .html( buttons.prop );

      buttonsHolder.append( buttonsTitle );

      for ( var i = 0; i < buttons.list.length; i ++ ) {
        var button = new Button( i );
      }
    }

    //------------------------------

    function Button ( i ) {

      this.value = buttons.list[ i ];

      var item = $.create('button')
                  .addClass( [ 'button' ] )
                  .val( this.value )
                  .html( this.value );

      this.item = item;

      this.checkIsCurrent();

      buttonsHolder.append( item );

      item.elem.onclick = function () {
        if ( buttons.current ) {
          buttons.current.removeClass( buttons.currentClass );
        }

        item.addClass(buttons.currentClass);
        config.targetElem.attr( buttons.prop, this.value );

        buttons.current = item;

        if ( buttons.switchUnits === true ) {
          resetRangesValues();
        }
      }
    }

    //------------------------------

    Button.prototype.checkIsCurrent = function () {

      if ( !buttons.current ) {

        if ( buttons.default ) {
            if ( this.value === buttons.default ) {
              buttons.current = this.item;
            }
        }
        else {
          buttons.current = this.item;
        }

        if ( buttons.current ) {
          buttons.current.addClass( buttons.currentClass );
          config.targetElem.attr( buttons.prop, this.value );
        }
      }
    }

    //------------------------------

    demosBuilder.create = function () {

      if ( !window.$ ) {
        window.$ = tinyLib;
      }

      if ( !window.config ) {
        console.log( 'Config not found' );
        return;
      }

      var demoContentClasses = {
        'svg-only': 'svg-only',
        'left-range': 'left-range',
        'top-range': 'top-range',
        'both-ranges': 'both-ranges'
      };

      demo = $.get('.demo');
      demoContent = $.get('.demo__content')
                         .addClass( 'demo__content--' +demoContentClasses[ config.demoContentLayout ] );

      //------------------------------

      ranges = config.inputs.ranges;
      rangesHolder;

      buttons = config.inputs.buttons;
      buttonsHolder;

      if ( buttons ) {
        addButtons();
      }

      if ( ranges ) {
        addRanges();
      }
    };

    //------------------------------

    return demosBuilder;
  }

  if( !window.demosBuilder ){
    window.demosBuilder = define_library();
  }

})( window )
