(function (window) {

  'use strict';

  function defineLibrary() {

    var doc = document;
    var demosBuilder = {};
    var demo;
    var demoContent;
    var ranges;
    var rangesHolder;

    var buttons;
    var buttonsHolder;

    var resizeControl;

    //------------------------------

    function Range(i) {

      var item = ranges.list[i];
      var prefix = 'range--' + item.id;
      this.item = item;
      this.valName = item.valName;
      this.units = ranges.units || '';
      this.transform = this.item.transform;
      this.targetElem = ranges.targetElem || config.targetElem;
      var attrs = ranges.attrs;

      if (ranges.keepViewBoxRatio && this.valName === 'height') {
        attrs = copyObj(attrs);
        attrs.value = attrs.value / ranges.ratio;
        attrs.max = attrs.max / ranges.ratio;
      }

      if (item.value) {
        attrs.value = item.value;
      }

      if (item.max) {
        attrs.max = item.max;
      }

      var rangeHolder = $.create('div')
        .addClass(['range', 'range--' + item.id]);

      this.title = $.create('div')
        .addClass(['range__title']);

      this.input = $.create('input')
        .attr(attrs)
        .addClass(['range__input']);

      rangeHolder.append(this.title).append(this.input);
      rangesHolder.append(rangeHolder);

      var that = this;

      this.input.elem.oninput = function () {
        that.setValue();

        if (ranges.isTied) {
          var siblingValue = this.value;

          if (ranges.keepViewBoxRatio) {
            if (that.valName === 'width') {
              siblingValue = siblingValue / ranges.ratio;
            } else if (that.valName === 'height') {
              siblingValue = siblingValue * ranges.ratio;
            }
          }

          that.sibling.input.elem.value = siblingValue;
          that.sibling.setValue();
        }
      };

      return this;
    };

    //------------------------------

    Range.prototype.setValue = function () {
      var value = this.input.elem.value;
      var attrValue;
      var visibleValue;
      var valName = this.valName;
      var title = this.valName;
      if (ranges.prefix) {
        title = ranges.prefix + ' ' + title;
      }

      if (this.transform) {
        value = this.getTransform();
      } else if (buttons && buttons.switchUnits === true) {

        value = convertValue(this.input.elem.value);
      } else {
        // $.out('— no values processing');
        value += this.units;
      }

      attrValue = value;
      visibleValue = value;

      if (ranges.targetAttr && ranges.targetAttr === 'viewBox') {
        var params = {};
        params[this.valName] = value;
        valName = 'viewBox';
        attrValue = getViewBox(params);
      }

      this.targetElem.attr(valName, attrValue);
      this.title.html(title + ': ' + visibleValue);

      if (resizeControl) {
        resizeControl.updateOffsets();
      }

    };

    //------------------------------

    function getViewBox(params) {
      var inputs = config.inputs.ranges.collection;

      // Inputs does not exists yet
      if (inputs.length < 2) {
        return;
      }

      var set = {
        x: params.x || 0,
        y: params.y || 0,
        width: params.width || ranges.elems.width.elem.value,
        height: params.height || ranges.elems.height.elem.value,
      };

      return [set.x, set.y, set.width, set.height].join(' ');
    }

    //------------------------------

    Range.prototype.getTransform = function () {
      var value = this.input.elem.value;

      var transformName = this.transform.name;
      var transformSet = [value];

      var currentButtonVal = buttons.current.val();

      var transformOrigin = this.transform.origin ? this.transform.origin[currentButtonVal] : null;

      if (transformOrigin &&
        transformName == 'rotate') {
        transformSet = transformSet.concat(transformOrigin);
      }

      value = transformName + '(' + transformSet.join(', ') + ')';

      return value;
    }

    //------------------------------

    function convertAttrs(elemSet) {
      var elem = elemSet.elem;
      var attrsList = elem.attributes;

      for (var i = 0; i < attrsList.length; i++) {
        var attrItem = attrsList[i];
        var attrName = attrItem.name;
        var attrValue = +attrItem.value.replace('%', '');

        if (!isNaN(attrValue)) {
          attrValue = convertValue(attrValue);
          elemSet.attr(attrName, attrValue);
        }
      }
    }

    //------------------------------

    function convertValue(value) {
      var newValue = 0;
      var currentButtonVal = buttons.current.val();

      //objectBoundingBox
      if (currentButtonVal === 'objectBoundingBox') {

        if (value < 1) {
          newValue = value;
        } else {
          newValue = value / 100;
        }
      }
      //userSpaceOnUse
      else {
        if (value < 1) {
          newValue = value * 100;
        } else {
          newValue = value;
        }

        newValue += ranges.units;
      }

      return newValue;
    }

    //------------------------------

    function copyObj(obj) {
      var newObj = {};

      for (var key in obj) {
        newObj[key] = obj[key];
      }

      return newObj;
    }

    //------------------------------

    function addRanges() {

      ranges.collection = [];
      ranges.elems = {};

      rangesHolder = $.create('div')
        .addClass([
          'controls',
          'controls--ranges'
        ]);

      demoContent.prepend(rangesHolder);

      if (ranges.keepViewBoxRatio) {
        var targetElem = ranges.targetElem || config.targetElem;
        var viewBoxValues = targetElem.elem.viewBox.baseVal;
        ranges.ratio = viewBoxValues.width / viewBoxValues.height;
      }

      for (var i = 0; i < ranges.list.length; i++) {
        var range = new Range(i);

        range.setValue();
        ranges.collection[i] = range;
        ranges.elems[ranges.list[i].valName] = range.input;
      }

      if (ranges.isTied && ranges.list.length === 2) {
        ranges.collection[0].sibling = ranges.collection[1];
        ranges.collection[1].sibling = ranges.collection[0];
      }
    }

    //------------------------------

    function resetRangesValues() {

      if (ranges.targetElem) {
        convertAttrs(ranges.targetElem);
      }

      for (var i = 0; i < ranges.collection.length; i++) {
        ranges.collection[i].setValue();
      }
    }

    //------------------------------

    function addButtons() {

      buttonsHolder = $.create('div')
        .addClass([
          'controls',
          'controls--buttons',
          'controls--' + buttons.prop
        ]);

      demo.prepend(buttonsHolder);

      var buttonsTitle = $.create('h2')
        .addClass('controls__title')
        .html(buttons.prop);

      buttonsHolder.append(buttonsTitle);

      for (var i = 0; i < buttons.list.length; i++) {
        var button = new Button(i);
      }
    }

    //------------------------------

    function Button(i) {

      this.value = buttons.list[i];

      var item = $.create('button')
        .addClass(['button'])
        .val(this.value)
        .html(this.value);

      this.item = item;

      this.checkIsCurrent();

      buttonsHolder.append(item);

      item.elem.onclick = function () {
        if (buttons.current) {
          buttons.current.removeClass(buttons.currentClass);
        }

        item.addClass(buttons.currentClass);
        config.targetElem.attr(buttons.prop, this.value);

        buttons.current = item;

        if (buttons.switchUnits === true) {
          resetRangesValues();
        }
      }
    }

    //------------------------------

    Button.prototype.checkIsCurrent = function () {

      if (!buttons.current) {

        if (buttons.default) {
          if (this.value === buttons.default) {
            buttons.current = this.item;
          }
        } else {
          buttons.current = this.item;
        }

        if (buttons.current) {
          buttons.current.addClass(buttons.currentClass);
          config.targetElem.attr(buttons.prop, this.value);
        }
      }
    }

    //------------------------------

    function ResizeControl() {
      var that = this;
      this.targetElem = config.targetElem;
      var targetStyles = getComputedStyle(this.targetElem.elem);
      this.targetElem.width = +this.targetElem.attr('width') || parseInt(targetStyles.width);
      this.targetElem.height = +this.targetElem.attr('height') || parseInt(targetStyles.height);
      this.targetElem.top = parseInt(targetStyles.top) || 0;
      this.targetElem.left = parseInt(targetStyles.left) || 0;

      var parent = this.targetElem.elem.parentNode;

      this.control = $.create('button')
        .attr({
          'type': 'button'
        })
        .addClass('resize-control');

      parent.appendChild(this.control.elem);

      var controlWidth = getComputedStyle(this.control.elem).width;
      this.width = parseInt(controlWidth);
      this.min = parseInt(targetStyles.minHeight) || this.width;

      this.getOffsets();
      this.setOffsets();

      this.control.elem.onmousedown = function (event) {
        doc.onmousemove = function (event) {

          if ((that.targetElem.height + event.movementY) > that.min) {
            that.targetElem.height += event.movementY;
            that.top += event.movementY
          }

          if ((that.targetElem.width + event.movementX) > that.min) {
            that.targetElem.width += event.movementX;
            that.left += event.movementX;
          }

          that.setOffsets();
          that.setSizes();
        }
      };

      doc.onmouseup = function (event) {
        doc.onmousemove = null;
      };
    }

    //------------------------------

    ResizeControl.prototype.getOffsets = function () {
      // Use rect to get outer boundaries
      var rect = this.targetElem.elem.getBoundingClientRect();
      this.top = this.targetElem.top + rect.height - this.width;
      this.left = this.targetElem.left + rect.width - this.width;
    };

    //------------------------------

    ResizeControl.prototype.setOffsets = function () {
      this.control.elem.style.top = this.top + 'px';
      this.control.elem.style.left = this.left + 'px';
    };

    //------------------------------

    ResizeControl.prototype.setSizes = function () {
      var that = this;

      if (this.targetElem.attr('width')) {
        this.targetElem.attr('width', this.targetElem.width);
      } else {
        this.targetElem.elem.style.width = this.targetElem.width + 'px';
      }

      if (this.targetElem.attr('height')) {
        this.targetElem.attr('height', this.targetElem.height);
      } else {
        this.targetElem.elem.style.height = this.targetElem.height + 'px';
      }

      if (!ranges) {
        return;
      }

      ranges.collection.forEach(function (item) {
        item.input.elem.value = that.targetElem[item.valName];
        item.title.html(item.valName + ': ' + that.targetElem[item.valName]);
      });
    };

    //------------------------------

    ResizeControl.prototype.updateOffsets = function () {
      this.targetElem.width = +this.targetElem.attr('width');
      this.targetElem.height = +this.targetElem.attr('height');
      this.getOffsets();
      this.setOffsets();
    }

    //------------------------------

    demosBuilder.create = function () {

      if (!window.$) {
        window.$ = tinyLib;
      }

      if (!window.config) {
        console.log('Config not found');
        return;
      }

      // To keep all available classes
      var demoClasses = {
        'buttons-left': 'buttons-left'
      };

      var demoContentClasses = {
        'svg-only': 'svg-only',
        'left-range': 'left-range',
        'top-range': 'top-range',
        'both-ranges': 'both-ranges',
        'square': 'square'
      };

      demo = $.get('.demo');

      if (config.demoLayout) {
        demo.addClass('demo--' + demoClasses[config.demoLayout]);
      }

      demoContent = $.get('.demo__content')
        .addClass('demo__content--' + demoContentClasses[config.demoContentLayout]);

      //------------------------------

      if (config.inputs) {
        if (config.inputs.ranges) {
          ranges = config.inputs.ranges;
          rangesHolder;
        }

        if (config.inputs.buttons) {
          buttons = config.inputs.buttons;
          buttonsHolder;
        }

        // Order is important
        if (buttons) {
          addButtons();
        }
        if (ranges) {
          addRanges();
        }
      }

      if (config.resizeable) {
        resizeControl = new ResizeControl();
      }
    };

    //------------------------------

    return demosBuilder;
  }

  if (!window.demosBuilder) {
    window.demosBuilder = defineLibrary();
  }

})(window)
