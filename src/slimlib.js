const SlimView = function (sv) {
    'use strict';

    /**
     * Configuration class for SlimView to operate with.
     */
    class Config {
        constructor() {
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
        }
    }

    class MessageChannel {

        /**
         * @param {Config} config
         */
        constructor(config) {
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
             * @type {?string}
             * @private
             */
            this._viewId = null;
            /**
             * Listener closure that handles message events and scoping of execution
             * @param ev
             * @private
             */
            this._listenerClosure = (ev) => {
            };

            this._onError = null;
            this._onMessage = null;
        }

        /**
         * Starts SlimView
         * Opens it in a new window, start listening to messages and goes through the handshake
         * @param {Channel~errorCallback} onError
         * @param {Channel~messageCallback} onMessage
         */
        start(onError, onMessage) {
            if(!!this.slimviewRef) throw 'SlimView seems to have already been loaded';
            this._onError = onError;
            this._onMessage = onMessage;
            // open
            let url = MessageChannel._buildSlimViewUrl(this);
            this.slimviewRef = window.open(url, 'Preview', 'height=800px,width=1000px,modal=yes,alwaysRaised=yes');
            // onError
            const that = this;
            this._listenerClosure = (ev) => {
                that._onMessageArrived.call(that, ev);
            };
            window.addEventListener('message', this._listenerClosure, false);
        }

        /**
         * Closes SlimView and stops listening for messages
         */
        stop() {
            this.slimviewRef.close();
            this.slimviewRef = null;
            window.removeEventListener('message', this._listenerClosure, false);
        }

        _onMessageArrived(ev) {
            if (!this._validateMessageSource(ev)) {
                console.warn('Message Arrived from invalid source: ', ev.source, ev.data);
                return;
            }
            var message = this._decodeMessage(ev.data);
            // TODO: viewId validation
            this._routeMessage(message);
        }

        _routeMessage(message) {
            // TODO: validate requestId
            switch (message['command']) {
                case 'slimViewLoaded':
                    // respond with 'vendorReady' + token
                    let params = {};
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

        _postResponse(command, messageMap) {
            let envelope = {
                'command': command,
                'viewId': this._viewId,
                'response': messageMap
            };
            this.slimviewRef.postMessage(JSON.stringify(envelope), this._endpointOrigin);
        }

        postRequest(command, messageMap) {
            let requestId = MessageChannel._getRandomString();
            let envelope = {
                'command': command,
                'viewId': this._viewId,
                'messageId': requestId,
                'parameters': messageMap
            };
            // TODO: register requestId
            this.slimviewRef.postMessage(JSON.stringify(envelope), this._endpointOrigin);
        }

        _decodeMessage(data) {
            return JSON.parse(data);
        }

        /**
         * Parses the endpoint and returns the origin of the SlimView
         * @returns {string}
         * @private
         */
        get _endpointOrigin() {
            return MessageChannel._parseUrl(this._config.endpoint).origin;
        }

        /**
         * Validates that the message arrived from the window
         * MessageChannel opened and that the origin of it matches
         * SlimView's.
         * @param {MessageEvent} ev
         * @returns {boolean}
         */
        _validateMessageSource(ev) {
            return ev.source === this.slimviewRef
                && ev.origin === this._endpointOrigin;
        }

        /**
         * @param {String} url
         * @returns {Element}
         * @private
         */
        static _parseUrl(url) {
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
        static _buildSlimViewUrl(channel) {
            // targetLanguage
            // url
            // viewId
            // o = '2'
            const config = channel._config;
            let endpointUri = MessageChannel._parseUrl(config.endpoint);
            channel._viewId = MessageChannel._getRandomString();
            let pathname = endpointUri.pathname.replace(/\/$/, '');
            let endpointString = endpointUri.origin + pathname + '/' + config.projectCode
                + '?targetLanguage=' + config.targetLanguage
                + '&url=' + encodeURIComponent(config.previewPage)
                + '&viewId=' + channel._viewId;
            if (!!config.extra && typeof config.extra === 'object') {
                for (let key in config.extra) {
                    endpointString += '&' + key + '=' + config.extra[key];
                }
                if (!('o' in config.extra)) {
                    endpointString += '&o=2'
                }
            } else {
                endpointString += '&o=2'
            }
            return endpointString;
        }

        /**
         * Random string for ViewId
         * @returns {string}
         * @private
         */
        static _getRandomString() {
            return Math.random().toString(36).substring(7);
        }

        static get _errorCommands() {
            return ['invalidAccessToken'];
        }
    }

    /**
     * Channel is responsible for handling
     *  - secrutiy
     *  - opening/closing it
     *  - sending and routing messages to and from SlimView
     */
    class Channel {
        constructor(config) {
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
             * @type {Channel~messageCallback|null}
             * @private
             */
            this._messageCallback = null;
        }

        /**
         * @type {Config}
         */
        get config() {
            return this._config;
        }

        /**
         * Is SlimView window opened?
         * @returns {boolean}
         */
        get isOpen() {
            return this._messageChannel !== null && !!this._messageChannel.slimviewRef;
        }

        /**
         * Window reference for the SlimView
         * @returns {Window|*}
         */
        get window() {
            return this._messageChannel == null ? null : this._messageChannel.slimviewRef;
        }

        /**
         * Opens SlimView with provided configuration
         */
        openInNewWindow() {
            if (!this._errorCallback) {
                throw 'You need to specify a callback with .onError() before you can open SlimView'
            }
            this._messageChannel = new MessageChannel(this.config);
            this._messageChannel.start(this._errorCallback, this._messageCallback);
        }

        /**
         * Stops listening on message events and closes the SlimView window
         */
        close() {
            this._messageChannel.stop();
        }

        /**
         * Register callback function to invoke when an error message arrives from SlimView
         * @param {Channel~errorCallback} callback
         */
        onError(callback) {
            this._errorCallback = callback;
        }

        /**
         * Callback that is invoked when a message arrives from SlimView
         * @param {Channel~messageCallback} callback
         */
        onMessage(callback) {
            this._messageCallback = callback;
        }

        /**
         * Highlight an entry in SlimView
         * @param {string} id Id of the Segment to highlight
         */
        highlight(id) {
            this._messageChannel.postRequest('view', {
                'highlightedEntry': id
            });
        }

        /**
         * Instruct SlimView to perfoem a search for given content fragment
         * @param {string} fragment Fragment to search for
         */
        find(fragment) {
            throw "Unimplemented";
        }

        /**
         * Send a translation to SlimView
         * @param {string} id Id of the Segment to highlight
         * @param {string} translation Translation to replace current content with
         * @param {boolean} save Attempt to save translation in Easylnig
         */
        translate(id, translation, save) {
            if (save === true) {
                console.warn("Current SlimView does not support saving - it is operating in a read-only mode");
                save = false;
            }
            let update = [{
                'key': id,
                'target': translation,
                'propagate': true
            }];
            this._messageChannel.postRequest('submitTargets', {
                'updates': update,
                'save': save
            })
        }

        /**
         * Navigate SlimView to a different page
         * @param {string} previewUrl
         */
        navigate(previewUrl) {
            // TODO: implement
            // this._messageChannel.postRequest('setHighlightView', {
            //     'uri': previewUrl
            // });
        }

        /**
         * Highlighting will be enabled in SlimView
         */
        enableHighlighting() {
            this._messageChannel.postRequest('view', {
                'mode': 'highlight'
            });
        }

        /**
         * Highlighting will be disabled in SlimView - users can navigate between pages
         */
        disableHighlighting() {
            this._messageChannel.postRequest('view', {
                'mode': 'free-click'
            });
        }

        static _validateConfig(config) {
            if (!config || !(config instanceof Config)) {
                throw "Channel expects first parameter to be SlimView.Config"
            }
        }
    }

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
