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
            setTimeout(function() {
                // get elements with focus index
                // var elements = widget._getElementsWithFocusIndex();
                var targetEls = widget._getElements();

                // for each, add the event listener and dataset attribute on the
                //  appropriate child
                for (var i = 0; i < targetEls.length - 1; i++) {
                    targetEls[i].addEventListener('blur', widget._doScroll);
                }
            }, 3000);

        },

        _getElementsWithFocusIndex: function() {
            return Array.from(document.querySelectorAll('[focusindex]')) // inputs, selects
                .filter(function(e) {
                    return e.getAttribute('focusindex') * 1 != 0;
                }) // only elements with a tab index
                .sort(function(a, b) {
                    return a.getAttribute('focusindex') * 1 - b.getAttribute('focusindex') * 1;
                }); // sorted smallest to highest
        },

        _getElements: function() {
          var ret = [];
          for (var i = 0; i < this.elements.length; i++){
            var thisEl = document.querySelector('.mx-name-' + this.elements[i].mxName);
            var target = thisEl.querySelector('input, select');
            if (i < this.elements.length-1){
                target.dataset.mxNext = i+1;
            }
            target.dataset.mxCurr = i;
            ret.push(target);
          }
          return ret;
        },

        _doScroll: function(el) {
            // animate the right part of the page to scroll to the element at
            //  el.target.dataset.nextMxElement

            $(el.target.closest('.mx-scrollcontainer-wrapper'))
                .scrollTo(
                    $('[data-mx-curr="' + el.target.dataset.mxNext + '"]'), {
                        duration: 2000
                    }
                );

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
