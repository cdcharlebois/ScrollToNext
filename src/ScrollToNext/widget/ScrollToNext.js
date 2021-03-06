define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "ScrollToNext/lib/jquery",
    "ScrollToNext/lib/jquery.scrollTo",

], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, ScrollTo) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    return declare("ScrollToNext.widget.ScrollToNext", [_WidgetBase], {


        // Internal variables.
        _handles: null,
        _contextObj: null,

        //modeler
        elements: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            //Polyfill so we can use element.closest in IE
            // matches polyfill
            window.Element && function(ElementPrototype) {
                ElementPrototype.matches = ElementPrototype.matches ||
                    ElementPrototype.matchesSelector ||
                    ElementPrototype.webkitMatchesSelector ||
                    ElementPrototype.msMatchesSelector ||
                    function(selector) {
                        var node = this,
                            nodes = (node.parentNode || node.document).querySelectorAll(selector),
                            i = -1;
                        while (nodes[++i] && nodes[i] != node);
                        return !!nodes[i];
                    };
            }(Element.prototype);

            // closest polyfill
            window.Element && function(ElementPrototype) {
                ElementPrototype.closest = ElementPrototype.closest ||
                    function(selector) {
                        var el = this;
                        while (el.matches && !el.matches(selector)) el = el.parentNode;
                        return el.matches ? el : null;
                    };
            }(Element.prototype);

            //End polyfill
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._setupListeners();
            this._updateRendering(callback);
        },

        resize: function() {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },
        // .region-content .mx-scrollcontainer-wrapper
        _setupListeners: function() {
            var widget = this;
            var wait = setInterval(function() {
              if (widget._getElements().length > 0) {
                act();
                clearInterval(wait);
              }
            }, 100);
            var act = function(){
              var targetEls = widget._getElements();
              for (var i = 0; i < targetEls.length; i++) {
                  // if (targetEls[i].tagName.toUpperCase() === 'SELECT'){
                  //   // also add change for select
                  //   widget.connect(targetEls[i], "change", widget._doScroll);
                  // }
                  // else {
                    widget.connect(targetEls[i], "blur", widget._doScroll);
                  // }
              }
            };

        },

        _getElements: function() {
          var ret = [];
          for (var i = 0; i < this.elements.length; i++){
            var thisEl = document.querySelector('.mx-name-' + this.elements[i].mxName);
            if (!thisEl) continue;
            var target = thisEl.querySelector('input, select');
            if (!target) continue;
            // if (i < this.elements.length-1){
            //     target.dataset.mxNext = i+1;
            // }
            target.dataset.mxCurr = i;
            ret.push(target);
          }
          return ret;
        },

        _doScroll: function(el) {
            // animate the right part of the page to scroll to the element at
            //  el.target.dataset.nextMxElement
            var $wrapper = $(el.target.closest('.mx-scrollcontainer-wrapper'))
            // ,   $target  = $('[data-mx-curr="' + el.target.dataset.mxNext + '"]');
            ,   $target  = this._getNextVisibleElement(el.target.dataset.mxCurr*1);

            if ($target){
              $wrapper
                  .scrollTo(
                      $target, {
                          duration: 2000,
                          offset: (-$(window).height() / 2) + $wrapper.offset().top
                      }
                  );
            }


        },

        // Get next visible element
        // ------------------------
        // @param start : number : the index in `this.elements` of the just
        //  completed element.
        // @RETURN : htmlElement : the next visible element
        _getNextVisibleElement: function(start){
          for (var i = start+1; i < this.elements.length; i++) {
            var $target = $('.mx-name-' + this.elements[i].mxName);
            if ($target && $target.is(':visible')) return $target;
            else continue;
          }
          return null;
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["ScrollToNext/widget/ScrollToNext"]);
