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
 * @fileoverview Provides support for having sets of models
 */ 

goog.provide('caffeine.Model.Set');

goog.require('goog.structs.Set');

/**
 * @constructor
 * @extends {goog.structs.Set}
 */
caffeine.Model.Set = function(model) {
  goog.base(this);
  this.model_ = model;
  this.xhr_ = new goog.net.XhrIo;
};
goog.inherits(caffeine.Model.Set, goog.structs.Set);

/**
 * Add a model object to this set
 * @param {caffeine.Model} modelObj Model object to add to set
 */
caffeine.Model.Set.prototype.add = function(modelObj) {
  if (!(modelObj instanceof this.model_)) {
    throw Error('Model object provided is not the valid type of model');
  }
  goog.base(this, 'add');
};

/**
 * Create a new model object and append to set
 * @param {Object} values Values to populate model with
 * @returns {caffeine.Model}
 */
caffeine.Model.Set.prototype.create = function(values) {
  var obj = new this.model_(values);
  this.add(obj);
  return obj;
};

caffeine.Model.Set.prototype.all = function() {
  
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
