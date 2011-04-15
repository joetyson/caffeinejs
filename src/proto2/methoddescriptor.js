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

goog.provide('cafe.proto2.MethodDescriptor');


/**
 * @param {string} name Name of method.
 * @param {!goog.proto2.Message} request_type The request message.
 * @param {!goog.proto2.Message}  response_type The response message.
 * @constructor
 */
cafe.proto2.MethodDescriptor = function(name, request_type, response_type) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {!goog.proto2.Message}
   * @private
   */
  this.requestType_ = request_type;

  /**
   * @type {!goog.proto2.Message}
   * @private
   */
  this.responseType_ = response_type;
};

/**
 * @return {string}
 */
cafe.proto2.MethodDescriptor.prototype.getName = function() {
  return this.name_;
};

/**
 * Returns response Message.
 * @return {!goog.proto2.Message}
 */
cafe.proto2.MethodDescriptor.prototype.getResponseType = function() {
  return this.responseType_;
};

/**
 * Returns request Message.
 * @return {!goog.proto2.Message}
 */
cafe.proto2.MethodDescriptor.prototype.getRequestType = function() {
  return this.requestType_;
};
