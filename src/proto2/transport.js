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

goog.provide('cafe.proto2.Rpc');
goog.provide('cafe.proto2.Rpc.State');
goog.provide('cafe.proto2.Transport');

goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.XhrIo');
goog.require('goog.proto2.ObjectSerializer');


/**
 * Represents a single remote procedure call.
 * @param {goog.proto2.Message} request The request.
 * @constructor
 */
cafe.proto2.Rpc = function(request) {
  /**
   * @type {cafe.proto2.Message}
   * @private
   */
  this.request_ = request;

  /**
   * @type {?cafe.proto2.Message}
   * @private
   */
  this.response_ = null;

  /**
   * @type {cafe.proto2.Rpc.State}}
   * @private
   */
  this.state_ = cafe.proto2.Rpc.State.RUNNING;

  /**
   * @private
   */
  this.error_message_ = null;

  /**
   * @private
   */
  this.error_name_ = null;
};
goog.inherits(cafe.proto2.Rpc, goog.events.EventTarget);

/**
 * Set the RPC response message.
 * @param {goog.proto2.Message} response The response message.
 */
cafe.proto2.Rpc.prototype.setResponse = function(response) {
  this.response_ = response;
  this.setState_(cafe.proto2.Rpc.State.OK);
};

/**
 * Get the response from the RPC.
 * @return {goog.proto2.Message} Response as message object.
 */
cafe.proto2.Rpc.prototype.getResponse = function() {
  return this.response_;
};

/**
 * Set the state of the RPC.
 * @param {cafe.proto2.Rpc.State} state The RPC state to set.
 */
cafe.proto2.Rpc.prototype.setState_ = function(state) {
  this.state_ = state;
  this.dispatchEvent(state);
};

/**
 * The state of the RPC.
 * @enum
 */
cafe.proto2.Rpc.State = {
  OK: 'ok',
  RUNNING: 'running',
  REQUEST_ERROR: 'error',
  SERVER_ERROR: 'error',
  NETWORK_ERROR: 'error',
  APPLICATION_ERROR: 'error'
};


/**
 * Serializer to use for encoding and decoding proto2 messages
 * @type {goog.proto2.ObjectSerializer}
 */
cafe.proto2.serializer = new goog.proto2.ObjectSerializer();

/**
 * Helper function to encode a proto2 message
 * @param {goog.proto2.Message} message Proto2 Message.
 */
cafe.proto2.encode_message = function(message) {
  var serializer = cafe.proto2.serializer;
  return goog.json.serialize(serializer.serialize(message));
};

/**
 * Helper function to decode an object into a proto2 message
 * @param {goog.proto2.Descriptor} descriptor Message descriptor.
 */
cafe.proto2.decode_message = function(descriptor, obj) {
  var serializer = cafe.proto2.serializer;
  return serializer.deserialize(descriptor, obj);
};


/**
 * Transport Layer
 *
 * In the future this should be inherited by a transport that knows
 * more about the data being sent over. This should only provide an
 * interface for a send_rpc, and probably some kind of error handling.
 *
 * @param {string} path The path to the service.
 * @constructor
 */
cafe.proto2.Transport = function(path) {
  this.path_ = path;
};

/**
 * Method to send a request over transport
 *
 * !!! Warning: This is just a proof of concept !!!
 *
 * @param {Object} method_info Method Descriptor meta.
 * @param {goog.proto2.Message} request The request.
 */
cafe.proto2.Transport.prototype.send_rpc = function(method_info, request) {
  var rpc = new cafe.proto2.Rpc(request);
  var encoded_message = cafe.proto2.encode_message(request);

  // And you should stop reading here.. The rest of this is garbage.

  goog.net.XhrIo.send(this.path_ + '.' + method_info.name, function(e) {
    var xhr = e.target;
    var encoded = xhr.getResponseJson();
    var response = cafe.proto2.decode_message(
      method_info.responseType.getDescriptor(), encoded);
    rpc.setResponse(response);
  }, 'POST', encoded_message, {
    'Content-Type': 'application/x-google-protojson'});
  return rpc;
};
