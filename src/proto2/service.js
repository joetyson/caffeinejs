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

goog.provide('cafe.proto2.Service');

goog.require('cafe.proto2.MethodDescriptor');
goog.require('cafe.proto2.ServiceDescriptor');

goog.require('goog.array');

/**
 * @param {cafe.proto2.Transport} transport The transport.
 * @constructor
 */
cafe.proto2.Service = function(transport) {
  /**
   * @type {cafe.proto2.ServiceDescriptor}
   */
  this.descriptor_ = this.constructor.descriptor_;

  /**
   * @type {cafe.proto2.Transport}
   */
  this.transport_ = transport;
};

/**
 * @param {string} method Method name.
 * @param {goog.proto2.Message} request The request.
 * @param {Function=} opt_done The callback.
 */
cafe.proto2.Service.prototype.call$Method = function(method, request, opt_done) {
  var transport = this.transport_;
  window['desc'] = this.descriptor_;
  var method_descriptor = this.descriptor_.getMethodByName(method);
  var method_info = {
    name: method_descriptor.getName(),
    responseType: method_descriptor.getResponseType()
  };
  var rpc = transport.send_rpc(method_info, request);
  rpc.addEventListener('ok', function(e) {
    var resp = e.target.getResponse();
    opt_done(resp);
  });
};


/**
 * @type {{method_name: (string|undefined),
 *         response_type: (goog.proto2.Message|undefined),
 *         method_index: (Number),
 *         request_type: (goog.proto2.Message|undefined)}}
 */
cafe.proto2.MethodMetaobj = goog.typedef;

/**
 * @param {cafe.proto2.Service} service The service.
 * @param {string} name The name of the service.
 * @param {Array.<!cafe.proto2.MethodMetaobj>} methodArr Array of methods.
 */
cafe.proto2.Service.set$Metadata = function(service, name, methodArr) {
  var methods = {};

  goog.array.forEach(methodArr, function(methodObj) {
    methods[methodObj.method_name] = new cafe.proto2.MethodDescriptor(
      methodObj.method_name,
      methodObj.request_type,
      methodObj.response_type);
  });

  service.descriptor_ = new cafe.proto2.ServiceDescriptor(name, methods);

  service.getDescriptor = function() {
    return service.descriptor_;
  };
};
