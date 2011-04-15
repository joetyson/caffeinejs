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
 * @fileoverview Protocol Buffer (Service) Descriptor class.
 */

goog.provide('cafe.proto2.ServiceDescriptor');

goog.require('goog.object');

/**
 * A protocol buffer service descriptor.
 * @param {string} name Name of service.
 * @param {Array.<cafe.proto2.MethodDescriptor>} methods Method descriptors.
 * @constructor
 */
cafe.proto2.ServiceDescriptor = function(name, methods) {
  /**
   * @type {?string}
   * @private
   */
  this.name_ = name;

  /**
   * Method descriptors.
   * @type {Array.<cafe.proto2.MethodDescriptor>}
   * @private
   */
  this.methods_ = methods;
};

/**
 * Get a method descriptor by name.
 * @param {string} name Name of method.
 * @return {cafe.proto2.MethodDescriptor}
 */
cafe.proto2.ServiceDescriptor.prototype.getMethodByName = function(name) {
  return this.methods_[name];
};
