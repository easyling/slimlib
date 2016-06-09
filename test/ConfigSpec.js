var config;

describe('Config', function () {
    'use strict';
    it('SlimView context exists', function () {
        expect(SlimView).toBeDefined();
    });
    it('SlimView has Config', function () {
        var config = new SlimView.Config();
        expect(config).toBeDefined();
    });
    it('properties', function () {
        var config = new SlimView.Config();
        config.endpoint = 'a';
        expect(config.endpoint).toBe('a');
        config.token = 'b';
        expect(config.token).toBe('b');
        config.previewPage = 'c';
        expect(config.previewPage).toBe('c');
        config.targetLanguage = 'd';
        expect(config.targetLanguage).toBe('d');
        config.projectCode = 'e';
        expect(config.projectCode).toBe('e');
        var extra = {};
        config.extra = extra;
        expect(config.extra).toBe(extra);
    });
});

describe('Channel creation', function () {
    'use strict';

    var channel;
    beforeAll(function () {
        config = new SlimView.Config();
        config.endpoint = window.location.origin;
        config.token = 'nukunincs';
        config.previewPage = 'https://www.easyling.com';
        config.targetLanguage = 'hu-HU';
        config.projectCode = 'gereblye';
        config.extra = {'o': '2'};
    });
    afterAll(function () {
    });

    it('Instantiation', function () {
        expect(function () {
            new SlimView.Channel(null);
        }).toThrow();
        channel = new SlimView.Channel(config);
        expect(channel.config).toBe(config);
    });

    it('cannot open without onError', function () {
        expect(function () {
            channel.openInNewWindow();
        }).toThrow();
    });

    it('appropriate starting state', function () {
        expect(channel.isOpen).toBe(false);
        expect(channel.window).toBeNull();
    });

    it('can open/close', function () {
        spyOn(window, 'open')
            .and.callFake(function (url, title, opts) {
            expect(title).toBe('Preview');
            expect(opts).toBe('height=800px,width=1000px,modal=yes,alwaysRaised=yes');
            expect(url.indexOf(window.location.origin)).toBe(0);
            expect(url.indexOf('targetLanguage=hu-HU')).toBeGreaterThan(-1);
            expect(url.indexOf('/_sd/slim/gereblye')).toBeGreaterThan(-1);
            expect(url.indexOf('o=2')).toBeGreaterThan(-1);
            expect(url.indexOf('url=' + encodeURIComponent('https://www.easyling.com'))).toBeGreaterThan(-1);
            expect(url.indexOf('viewId=')).toBeGreaterThan(-1);
            return window;
        });
        var onErrorCb = jasmine.createSpy('error cb');
        var onMessageCb = jasmine.createSpy('message cb')
        channel.onError(onErrorCb);
        channel.onMessage(onMessageCb);
        channel.openInNewWindow();
        expect(window.open).toHaveBeenCalled();
        expect(channel.window).toBe(window);
        expect(channel.isOpen).toBe(true);

        spyOn(window, 'close');
        channel.close();
        expect(window.close).toHaveBeenCalled();
        expect(channel.window).toBeNull();
        expect(channel.isOpen).toBe(false);
        channel = null;
    });
});

describe('Channel callback routing', function () {
    'use strict';
    var runExpectations;
    var onErrorCb;
    var onMessageCb;
    var channel;
    beforeEach(function () {
        runExpectations = function () {
        };
        channel = new SlimView.Channel(config);
        onErrorCb = jasmine.createSpy('onErr').and.callFake(function (msg) {
            runExpectations();
        });
        onMessageCb = jasmine.createSpy('onMess').and.callFake(function (msg) {
            runExpectations();
        });
        channel.onError(onErrorCb);
        channel.onMessage(onMessageCb);
        spyOn(window, 'open').and.returnValue(window);
        channel.openInNewWindow();
    });
    it('asd', function () {
        expect(true).toBeTruthy();
    });
    afterEach(function () {
        onMessageCb.calls.reset();
        onErrorCb.calls.reset();
        channel.close();
        channel = null;
    });
    afterAll(function () {
        runExpectations = function () {
        };
    });
    it('routes to onMess if not error', function (done) {
        runExpectations = function () {
            expect(onMessageCb).toHaveBeenCalledTimes(1);
            expect(onErrorCb).not.toHaveBeenCalled();
            done();
        };
        window.postMessage(JSON.stringify({}), '*');
    });
    it('routes to onErr for error commands', function (done) {
        runExpectations = function () {
            // expect(onMessageCb).not.toHaveBeenCalled();
            // expect(onErrorCb).toHaveBeenCalledTimes(1);
            done();
        };
        window.postMessage(JSON.stringify({'command': 'invalidAccessToken'}), '*');
    });
    it('responds to slimViewLoaded', function (done) {
        runExpectations = function () {
            done();
        };
        window.postMessage(JSON.stringify({'command': 'slimViewLoaded'}), '*');
        spyOn(window, 'postMessage').and.callFake(function (message, origin) {
            expect(origin).toBe(window.location.origin);
            var decoded = JSON.parse(message);
            expect(decoded).toEqual(jasmine.objectContaining({
                'command': 'vendorReady'
            }));
            expect(decoded).toEqual(jasmine.objectContaining({
                'viewId': jasmine.any(String)
            }));
            expect(decoded).toEqual(jasmine.objectContaining({
                'response': jasmine.objectContaining({
                    'accessToken': config.token
                })
            }));
        });
    });
});

describe('commands', function () {
    'use strict';
    var channel;
    beforeEach(function () {
        channel = new SlimView.Channel(config);
        channel.onError(function () {
        });
        channel.onMessage(function () {
        });
        spyOn(window, 'open').and.returnValue(window);
        channel.openInNewWindow();
    });
    afterEach(function () {
        channel.close();
    });
    it('highlights', function (done) {
        spyOn(window, 'postMessage').and.callFake(function (message) {
            var decoded = JSON.parse(message);
            expect(decoded).toEqual(({
                'command': 'view',
                'viewId': jasmine.any(String),
                'messageId': jasmine.any(String),
                'parameters': jasmine.objectContaining({
                    'highlightedEntry': 'myid'
                })
            }));
            done();
        });
        channel.highlight('myid');
    });
    it('finds', function () {
        expect(function () {
            channel.find('anything');
        }).toThrow();
    });
    it('translates', function (done) {
        spyOn(window, 'postMessage').and.callFake(function (message) {
            var decoded = JSON.parse(message);
            expect(decoded).toEqual({
                'command': 'submitTargets',
                'viewId': jasmine.any(String),
                'messageId': jasmine.any(String),
                'parameters': {
                    'updates': [{
                        'key': jasmine.any(String),
                        'target': jasmine.any(String),
                        'propagate': true
                    }],
                    'save': false
                }
            });
            done();
        });
        channel.translate('myid', 'hello', true);
    });
    it('enable highlighting', function(done) {
        spyOn(window, 'postMessage').and.callFake(function (message) {
            var decoded = JSON.parse(message);
            expect(decoded).toEqual({
                'command': 'view',
                'viewId': jasmine.any(String),
                'messageId': jasmine.any(String),
                'parameters': {
                    'mode': 'highlight'
                }
            });
            done();
        });
        channel.enableHighlighting();
    });
    it('disable highlighting', function(done) {
        spyOn(window, 'postMessage').and.callFake(function (message) {
            var decoded = JSON.parse(message);
            expect(decoded).toEqual({
                'command': 'view',
                'viewId': jasmine.any(String),
                'messageId': jasmine.any(String),
                'parameters': {
                    'mode': 'free-click'
                }
            });
            done();
        });
        channel.disableHighlighting();
    });
    // TODO: implement
    // it('naviage', function(done) {
    // });
});