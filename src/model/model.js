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
 * @fileoverview Simple model support that provides basic RESTful syncing
 */ 
 

goog.provide('caffeine.Model');
goog.provide('caffeine.Model.Error');
goog.provide('caffeine.Model.EventType');

goog.require('goog.structs.Map');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.events.EventTarget');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');
goog.require('goog.debug.Logger');


/**
 * Caffeine Model
 * 
 * @param {Object} opt_values Values to load model with
 * @param {Object.<{type: caffeine.Model.FieldType, required: boolean}>=} 
 *           opt_fields The fields definition
 * @constructor
 * @extends {goog.events.EventTarget}
 */
caffeine.Model = function(values, opt_fields) {
  goog.base(this);
  if (!opt_fields && !this.fields) {
    throw Error('No fields specified!');
  }

  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.fields_ = new goog.structs.Map();
  this.addField('pk', { defaultValue: null, required: false });
  
  /**
   * @type {goog.structs.Map}
   * @private
   */
  this.attributes_ = new goog.structs.Map({'pk': null});

  /**
   * @type {Array.<Object>}
   */
  this.errors_ = [];
  
  /**
   * @type {boolean}
   * @private
   */
  this.dirty_ = !goog.object.containsKey(values, 'pk');

  /**
   * Does this model persist?
   * @type {boolean}
   * @private
   */
  this.persist_ = goog.isDef(this.resource);

  /**
   * @param {goog.net.XhrIo}
   */
  this.xhr_ = new goog.net.XhrIo;

  // When the XHR completes, call our onSuccess
  // TODO(joe): Error handling?
  goog.events.listen(this.xhr_, goog.net.EventType.COMPLETE, 
                     this.onSuccess_, this);
  
  var buildSchema = function(options, name, obj) {
    this.addField(name, options);
  };
  goog.object.map(opt_fields || this.fields, buildSchema, this);
  
  this.setAll(values);
};
goog.inherits(caffeine.Model, goog.events.EventTarget);


/**
 * Errors thrown by the model
 * @enum {string}
 */
caffeine.Model.Error = {
  NO_FIELD: 'Field does not exist',
  INVALID_VALIDATOR: 'The validator specified is invalid'
};

/**
 * Validate a value against a field name
 * @param {string} name Field name 
 * @param {*} value Field value
 * @return {boolean} True if valid
 */
caffeine.Model.prototype.validateField_ = function(name, value) {
  if (!this.fields_.containsKey(name)) {
    throw Error(caffeine.Model.Error.NO_FIELD);
  }
  var field = this.fields_.get(name);
  var validate = function(validator, i, arr) {
    // We take both objects and functions
    if (goog.isObject(validator) && validator['validate']) {
      var validateFunc = validator.validate;
    } else if(goog.isFunction(validator)) {
      var validateFunc = validator;
    } else {
      throw Error(caffeine.Model.Error.INVALID_VALIDATOR);
    }
    // Run validation function
    var validationResult = validateFunc.call(this, value);
    if (!validationResult) {
      this.errors_.push(validationResult);
    }
    return validationResult;
  };
  goog.array.forEach(field.validators, validate, this);
  return !Boolean(this.errors_.length);
};

/**
 * Serialize model to JSON
 */
caffeine.Model.prototype.serialize = function() {
  return goog.json.serialize(this.attributes_);
};

/**
 * Get URL for Resource
 * @return {goog.Uri} the uri
 */
caffeine.Model.prototype.getUrl = function() {
  var url = new goog.Uri(this.resource);
  if (this.isNew()) return url;
  url.setPath(url.getPath() + '/' + this.get('pk'));
  return url;
};

/**
 * @param {string} name Field name
 * @param {Object=} opt_options Field options
 */
caffeine.Model.prototype.addField = function(name, opt_options) {
  var options = {
    defaultValue: opt_options.defaultValue || null,
    required: opt_options.required || true,
    validators: opt_options.validators || [],
    serverKey: opt_options.serverKey || null,
    helpText: opt_options.helpText || null,
    fieldType: opt_options.fieldType || null
  };
  this.fields_.set(name, options);
};

caffeine.Model.prototype.setAll = function(values) {
  var loadData = function(val, key, obj) {
    this.set(key, val);
  };
  goog.object.map(values, loadData, this);
};

/**
 * Set value for a specified field for a model
 * @param {string} name field name
 * @param {string|Object|Array} value Value to store
 * @param {boolean} opt_sync Call sync?
 */
caffeine.Model.prototype.set = function(name, value, opt_sync) {
  if (!this.fields_.containsKey(name)) {
    throw Error(caffeine.Model.Error.NO_FIELD);
  }
  if (this.validateField_(name, value)) {
    this.attributes_.set(name, value);
    this.dirty_ = true;
    if (opt_sync) this.sync();
  } else {
    // this.errors_ has errors
  }
};

/**
 * Get a the value for a specified field from Model
 * @param {string} name Field
 * @param {string} opt_value Default value if key is undefined
 */
caffeine.Model.prototype.get = function(name, opt_value) {
  if (!this.fields_.containsKey(name)) {
    throw Error(caffeine.Model.Error.NO_FIELD);
  }
  // default value is never stored in attributes
  return this.attributes_.get(name, opt_value) || 
    (this.fields_.get(name)).defaultValue;
};

/**
 * Does this object exist on the server?
 * @return {boolean} Whether or not object has been persisted
 */
caffeine.Model.prototype.isNew = function() {
  return goog.isNull(this.get('pk'));
};


/**
 * @enum {Object}
 */
caffeine.Model.Action = {
  Create: { httpVerb: 'POST' },
  Read: { httpVerb: 'GET' },
  Update: {
    httpVerb: 'POST',
    httpOverride: 'PUT'
  },
  Delete: {
    httpVerb: 'POST',
    httpOverride: 'DELETE'
  }
};

/**
 * When XHR is successful
 * @param {goog.events.EventTarget} e 
 */
caffeine.Model.prototype.onSuccess_ = function(e) {
  var xhr = e.target;
  var obj = xhr.getResponseJson(caffeine.XSSI_PREFIX);
  this.setAll(obj);
};

/**
 * Take specified action on resource
 * @param {caffeine.Model.ResourceAction} action The resource action
 * @param {caffeine.Model.Action} action Action to perform 
 * @param {Function} callback Callback to call
 */
caffeine.Model.prototype.sync_ = function(action) {
  var headers = goog.structs.Map({
    'Content-Type': 'application/json',
    'X-CSRFToken': goog.net.cookies.get('csrftoken') || '',
    'X-HTTP-Method-Override': action.httpOverride || action.httpVerb
  });
  this.xhr_.send(this.getUrl().toString(), action.httpVerb, this.serialize(), 
                 headers);
};

/**
 * Read resource and sync to model from server
 */
caffeine.Model.prototype.fetch = function() {
  this.sync_(caffeine.Model.Action.Read);
};

/**
 * Create or Update resource on server
 */
caffeine.Model.prototype.save = function(){
  var action = this.isNew() ? 
    caffeine.Model.Action.Create :
    caffeine.Model.Action.Update;
  this.sync_(action);
};

/**
 * Delete resource from server
 */
caffeine.Model.prototype.destroy = function() {
  this.sync_(caffeine.Model.Action.Delete);
};

caffeine.Model.prototype.logger_ = 
  goog.debug.Logger.getLogger('caffeine.Model');