'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SlimView = function (sv) {
    'use strict';

    /**
     * Configuration class for SlimView to operate with.
     */

    var Config = function Config() {
        _classCallCheck(this, Config);

        /**
         * SlimView's endpoint
         * @type {string}
         */
        this.endpoint = '';
        /**
         * Access Token
         * @type {string}
         */
        this.token = '';
        /**
         * Page to load SlimView with
         * @type {string}
         */
        this.previewPage = '';
        /**
         * Language of the Preview
         * @type {string}
         */
        this.targetLanguage = '';
        /**
         * Project code to load the SlimView for
         * @type {string}
         */
        this.projectCode = '';

        /**
         * Extra parameters to pass to SlimView
         * @type {Map.<String, String>}
         */
        this.extra = {};
    };

    var MessageChannel = function () {

        /**
         * @param {Config} config
         */

        function MessageChannel(config) {
            _classCallCheck(this, MessageChannel);

            /**
             * @type {Config}
             * @private
             */
            this._config = config;
            /**
             * SlimView's window
             * @type {Window}
             */
            this.slimviewRef = null;
            /**
             * SlimView window instance identified by ViewId
             * @type {string}
             * @private
             */
            this._viewId = null;
            /**
             * Listener closure that handles message events and scoping of execution
             * @param ev
             * @private
             */
            this._listenerClosure = function (ev) {};

            this._onError = null;
            this._onMessage = null;
        }

        /**
         * Starts SlimView
         * Opens it in a new window, start listening to messages and goes through the handshake
         * @param {Channel~errorCallback} onError
         * @param {Channel~messageCallback} onMessage
         */


        _createClass(MessageChannel, [{
            key: 'start',
            value: function start(onError, onMessage) {
                this._onError = onError;
                this._onMessage = onMessage;
                // open
                var url = MessageChannel._buildSlimViewUrl(this);
                this.slimviewRef = window.open(url, 'Preview', 'height=800px,width=1000px,modal=yes,alwaysRaised=yes');
                // onError
                var that = this;
                this._listenerClosure = function (ev) {
                    that._onMessageArrived.call(that, ev);
                };
                window.addEventListener('message', this._listenerClosure, false);
            }

            /**
             * Closes SlimView and stops listening for messages
             */

        }, {
            key: 'stop',
            value: function stop() {
                this.slimviewRef.close();
                this.slimviewRef = null;
                window.removeEventListener('message', this._listenerClosure, false);
            }
        }, {
            key: '_onMessageArrived',
            value: function _onMessageArrived(ev) {
                if (!this._validateMessageSource(ev)) {
                    console.warn('Message Arrived from invalid source: ', ev.source, ev.data);
                    return;
                }
                var message = this._decodeMessage(ev.data);
                // TODO: viewId validation
                this._routeMessage(message);
            }
        }, {
            key: '_routeMessage',
            value: function _routeMessage(message) {
                // TODO: validate requestId
                switch (message['command']) {
                    case 'slimViewLoaded':
                        // respond with 'vendorReady' + token
                        var params = {};
                        if (!!this._config.token) {
                            params['accessToken'] = this._config.token;
                        }
                        this._postResponse('vendorReady', params);
                        break;
                    case 'vendorReady':
                        // empty message queue
                        // TODO: implement message queue
                        break;
                    default:
                    // call callback
                }
                if (MessageChannel._errorCommands.indexOf(message['command']) >= 0) {
                    this._onError.call(null, message);
                } else {
                    this._onMessage.call(null, message);
                }
            }
        }, {
            key: '_postResponse',
            value: function _postResponse(command, messageMap) {
                var envelope = {
                    'command': command,
                    'viewId': this._viewId,
                    'response': messageMap
                };
                this.slimviewRef.postMessage(JSON.stringify(envelope), this._endpointOrigin);
            }
        }, {
            key: 'postRequest',
            value: function postRequest(command, messageMap) {
                var requestId = MessageChannel._getRandomString();
                var envelope = {
                    'command': command,
                    'viewId': this._viewId,
                    'messageId': requestId,
                    'parameters': messageMap
                };
                // TODO: register requestId
                this.slimviewRef.postMessage(JSON.stringify(envelope), this._endpointOrigin);
            }
        }, {
            key: '_decodeMessage',
            value: function _decodeMessage(data) {
                return JSON.parse(data);
            }

            /**
             * Parses the endpoint and returns the origin of the SlimView
             * @returns {string}
             * @private
             */

        }, {
            key: '_validateMessageSource',


            /**
             * Validates that the message arrived from the window
             * MessageChannel opened and that the origin of it matches
             * SlimView's.
             * @param {MessageEvent} ev
             * @returns {boolean}
             */
            value: function _validateMessageSource(ev) {
                return ev.source === this.slimviewRef && ev.origin === this._endpointOrigin;
            }

            /**
             * @param {String} url
             * @returns {Element}
             * @private
             */

        }, {
            key: '_endpointOrigin',
            get: function get() {
                return MessageChannel._parseUrl(this._config.endpoint).origin;
            }
        }], [{
            key: '_parseUrl',
            value: function _parseUrl(url) {
                /**
                 * @type {HTMLAnchorElement}
                 */
                var parser = document.createElement('a');
                parser.href = url;
                return parser;
            }

            /**
             * @param channel
             * @returns {string}
             * @private
             */

        }, {
            key: '_buildSlimViewUrl',
            value: function _buildSlimViewUrl(channel) {
                // targetLanguage
                // url
                // viewId
                // o = '2'
                var config = channel._config;
                var endpointUri = MessageChannel._parseUrl(config.endpoint);
                channel._viewId = MessageChannel._getRandomString();
                var endpointString = endpointUri.origin + '/_sd/slim/' + config.projectCode + '?targetLanguage=' + config.targetLanguage + '&url=' + encodeURIComponent(config.previewPage) + '&viewId=' + channel._viewId;
                if (!!config.extra && _typeof(config.extra) === 'object') {
                    for (var key in config.extra) {
                        endpointString += '&' + key + '=' + config.extra[key];
                    }
                    if (!('o' in config.extra)) {
                        endpointString += '&o=2';
                    }
                } else {
                    endpointString += '&o=2';
                }
                return endpointString;
            }

            /**
             * Random string for ViewId
             * @returns {string}
             * @private
             */

        }, {
            key: '_getRandomString',
            value: function _getRandomString() {
                return Math.random().toString(36).substring(7);
            }
        }, {
            key: '_errorCommands',
            get: function get() {
                return ['invalidAccessToken'];
            }
        }]);

        return MessageChannel;
    }();

    /**
     * Channel is responsible for handling
     *  - secrutiy
     *  - opening/closing it
     *  - sending and routing messages to and from SlimView
     */


    var Channel = function () {
        function Channel(config) {
            _classCallCheck(this, Channel);

            Channel._validateConfig(config);
            /**
             * @type {Config}
             */
            this._config = config;

            /**
             * @type {MessageChannel}
             * @private
             */
            this._messageChannel = null;
            /**
             * @type {Channel~errorCallback} message
             * @private
             */
            this._errorCallback = null;
            /**
             *
             * @type {null}
             * @private
             */
            this._messageCallback = null;
        }

        /**
         * @type {Config}
         */


        _createClass(Channel, [{
            key: 'open',


            /**
             * Opens SlimView with provided configuration
             */
            value: function open() {
                if (!this._errorCallback) {
                    throw 'You need to specify a callback with .onError() before you can open SlimView';
                }
                this._messageChannel = new MessageChannel(this.config);
                this._messageChannel.start(this._errorCallback, this._messageCallback);
            }
        }, {
            key: 'close',
            value: function close() {
                this._messageChannel.stop();
            }

            /**
             * Register callback function to invoke when an error message arrives from SlimView
             * @param {Channel~errorCallback} callback
             */

        }, {
            key: 'onError',
            value: function onError(callback) {
                this._errorCallback = callback;
            }

            /**
             * Callback that is invoked when a message arrives from SlimView
             * @param callback
             */

        }, {
            key: 'onMessage',
            value: function onMessage(callback) {
                this._messageCallback = callback;
            }

            /**
             * Highlight an entry in SlimView
             * @param {string} id Id of the Segment to highlight
             */

        }, {
            key: 'highlight',
            value: function highlight(id) {
                this._messageChannel.postRequest('view', {
                    'highlightedEntry': id
                });
            }

            /**
             * Instruct SlimView to perfoem a search for given content fragment
             * @param {string} fragment Fragment to search
             */

        }, {
            key: 'find',
            value: function find(fragment) {
                throw "Unimplemented";
            }

            /**
             * Send a translation to SlimView
             * @param {string} id Id of the Segment to highlight
             * @param {string} translation Translation to replace current content with
             * @param {boolean} save Attempt to save translation in Easylnig
             */

        }, {
            key: 'translate',
            value: function translate(id, translation, save) {
                if (save === true) {
                    console.warn("Current SlimView does not support saving - it is operating in a read-only mode");
                    save = false;
                }
                var update = [{
                    'key': id,
                    'target': translation,
                    'propagate': true
                }];
                this._messageChannel.postRequest('submitTargets', {
                    'updates': update,
                    'save': save
                });
            }

            /**
             * Navigate SlimView to a different page
             * @param {string} previewUrl
             */

        }, {
            key: 'navigate',
            value: function navigate(previewUrl) {}
            // TODO: implement
            // this._messageChannel.postRequest('setHighlightView', {
            //     'uri': previewUrl
            // });


            /**
             * Highlighting will be enabled in SlimView
             */

        }, {
            key: 'enableHighlighting',
            value: function enableHighlighting() {
                this._messageChannel.postRequest('view', {
                    'mode': 'highlight'
                });
            }

            /**
             * Highlighting will be disabled in SlimView - users can navigate between pages
             */

        }, {
            key: 'disableHighlighting',
            value: function disableHighlighting() {
                this._messageChannel.postRequest('view', {
                    'mode': 'free-click'
                });
            }
        }, {
            key: 'config',
            get: function get() {
                return this._config;
            }

            /**
             * Is SlimView window opened?
             * @returns {boolean}
             */

        }, {
            key: 'isOpen',
            get: function get() {
                return this._messageChannel !== null && !!this._messageChannel.slimviewRef;
            }

            /**
             * Window reference for the SlimView
             * @returns {Window|*}
             */

        }, {
            key: 'window',
            get: function get() {
                return this._messageChannel == null ? null : this._messageChannel.slimviewRef;
            }
        }], [{
            key: '_validateConfig',
            value: function _validateConfig(config) {
                if (!config || !(config instanceof Config)) {
                    throw "Channel expects first parameter to be SlimView.Config";
                }
            }
        }]);

        return Channel;
    }();

    /**
     * @callback Channel~errorCallback
     * @param {Map} event data
     */
    /**
     * @callback Channel~messageCallback
     * @param {Map} event data
     */

    sv.Channel = Channel;
    sv.Config = Config;
    return sv;
}(SlimView || {});
//# sourceMappingURL=slimlib.js.map
