// Copyright 2010 CaffeineJS Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Simple LabelInput that fades out on focus.
 */

goog.provide('caffeine.ui.LabelInput');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.ui.Component');


/**
 * @param {string=} opt_label Label.
 * @param {boolean=} opt_focus focus after load.
 * @param {goog.dom.DomHelper=} opt_domHelper DOMHelper.
 *
 * @constructor
 * @extends {goog.ui.Component}
 */
caffeine.ui.LabelInput = function(opt_label, opt_focus, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.label_ = opt_label || '';
  this.focus_ = opt_focus;
};
goog.inherits(caffeine.ui.LabelInput, goog.ui.Component);

/**
 * @type {goog.events.EventHandler}
 */
caffeine.ui.LabelInput.prototype.eh_;

/** @inheritdoc */
caffeine.ui.LabelInput.prototype.createDom = function() {
  this.setElementInternal(
    this.getDomHelper().createDom('input', {'type': 'text'}));
};

/** @inheritdoc */
caffeine.ui.LabelInput.prototype.decorateInternal = function(element) {
  caffeine.ui.LabelInput.superClass_.decorateInternal.call(this, element);
  if (!this.label_) {
    this.label_ = element.getAttribute('label') || '';
  }
};

/** @inheritdoc */
caffeine.ui.LabelInput.prototype.enterDocument = function() {
  caffeine.ui.LabelInput.superClass_.enterDocument.call(this);
  this.attachEvents_();
  this.check_();
};

/** @inheritdoc */
caffeine.ui.LabelInput.prototype.exitDocument = function() {
  caffeine.ui.LabelInput.superClass_.exitDocument.call(this);
  this.detatchEvents_();
};

/** @inheritdoc */
caffeine.ui.LabelInput.prototype.disposeInternal = function() {
  caffeine.ui.LabelInput.superClass_.disposeInternal.call(this);
  this.detatchEvents_();
};

/**
 * Attach events to element
 * @private
 */
caffeine.ui.LabelInput.prototype.attachEvents_ = function() {
  var eh = new goog.events.EventHandler(this);
  eh.listen(this.getElement(), goog.events.EventType.FOCUS, this.handleFocus_);
  eh.listen(this.getElement(), goog.events.EventType.BLUR, this.handleBlur_);
  eh.listen(this.getElement(), goog.events.EventType.KEYDOWN, this.handleKey_);
  this.eh_ = eh;
};

/**
 * Detatch events from element
 * @private
 */
caffeine.ui.LabelInput.prototype.detatchEvents_ = function() {
  if (this.eventHandler_) {
    this.eh_.dispose();
    this.eh_ = null;
  }
};

/**
 * The CSS Class name to add to input when textfield is in blur
 */
caffeine.ui.LabelInput.prototype.BLUR_CLASS_NAME =
  goog.getCssName('label-input-blur');

/**
 * The CSS Class name to add to input when textfield is in focus
 */
caffeine.ui.LabelInput.prototype.FOCUS_CLASS_NAME =
  goog.getCssName('label-input-focus');


/**
 * Handler for the focus event
 * @param {goog.events.Event} e The event object passed to handler.
 * @private
 */
caffeine.ui.LabelInput.prototype.handleFocus_ = function(e) {
  this.hasFocus_ = true;
  this.check_();
};

/**
 * Handler for the blur event
 * @param {goog.events.Event} e The event object passed to handler.
 * @private
 */
caffeine.ui.LabelInput.prototype.handleBlur_ = function(e) {
  this.hasFocus_ = false;
  this.check_();
};

/**
 * Handler for the key event
 * @param {goog.events.Event} e The event object passed to handler.
 * @private
 */
caffeine.ui.LabelInput.prototype.handleKey_ = function(e) {
  goog.dom.classes.remove(this.getElement(), this.FOCUS_CLASS_NAME);
  if (!this.hasChanged()) {
    // TODO(jtyson): Use a <label> instead of using the input value
    this.getElement().value = '';
  }
};


/**
 * @return {boolean} Whether the value has been changed by the user.
 */
caffeine.ui.LabelInput.prototype.hasChanged = function() {
  return this.getElement().value != '' &&
    this.getElement().value != this.label_;
};

/**
 * Checks the state of the input element
 */
caffeine.ui.LabelInput.prototype.check_ = function() {
  if (!this.hasChanged()) {
    if (this.hasFocus_) {
      goog.dom.classes.addRemove(this.getElement(),
                                 this.BLUR_CLASS_NAME,
                                 this.FOCUS_CLASS_NAME);
      var moveCursor = function() {
        this.getElement().selectionStart = 0;
        this.getElement().selectionEnd = 0;
      };
      goog.Timer.callOnce(goog.bind(moveCursor, this), .01);
    } else {
      goog.dom.classes.addRemove(this.getElement(),
                                 this.FOCUS_CLASS_NAME,
                                 this.BLUR_CLASS_NAME);
    }
    // browser needs to catchup with css changes before restoring label
    goog.Timer.callOnce(this.restoreLabel_, 10, this);
  }
};

/**
 * Sets the value of the input element to label
 * @private
 */
caffeine.ui.LabelInput.prototype.restoreLabel_ = function() {
  if (this.getElement() && !this.hasChanged() && !this.hasFocus_) {
    if (this.focus_) {
      this.getElement().focus();
      this.focus_ = false;
    }
    this.getElement().value = this.label_;
  }
};
