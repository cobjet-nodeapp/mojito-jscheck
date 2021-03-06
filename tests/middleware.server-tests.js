/*jslint nomen:true, indent: 4 */
/*global YUI, YUITest, require, __dirname */

YUI.add('mojito-jscheck-middleware-tests', function (Y, NAME) {
    'use strict';

    var A = YUITest.Assert,
        suite = new YUITest.TestSuite(NAME),

        midPath = require('path').join(__dirname, '../middleware/mojito-jscheck.js'),

        appConfig = {
            jscheck: {
                cookie: {
                    domain: '.my.domain.com',
                    expiration: 2592000
                }
            }
        },

        midConfig = {
            Y: Y,
            store: {
                _appConfigStatic: appConfig
            }
        },

        mid;

    suite.add(new YUITest.TestCase({

        name: 'unit tests',

        'the middleware should just pass through if jscheck is disabled': function () {
            appConfig.jscheck.enabled = false;
            mid = require(midPath)(midConfig);

            var req = {},
                res = {},
                next = function () {
                    A.pass();
                };

            mid(req, res, next);
        },

        'js=0 is in the url, so the middleware should set the cookie': function () {
            appConfig.jscheck.enabled = true;
            mid = require(midPath)(midConfig);

            var headers = {},

                req = {
                    url: '/search?p=whatever&js=0',
                    cookies: {}
                },

                res = {
                    setHeader: function (key, val) {
                        headers[key.toLowerCase()] = val;
                    }
                },

                next = function () {
                    A.areSame(headers.hasOwnProperty('set-cookie'), true);
                    A.areSame(0, headers['set-cookie'].indexOf('js=0;domain=.my.domain.com;expires='));
                };

            mid(req, res, next);
        },

        'js=0 is in the url, so the middleware should set the sub-cookie': function () {
            appConfig.jscheck.cookie.name = 'sB';
            appConfig.jscheck.cookie.sub = 'js';
            appConfig.jscheck.cookie.domain = '.my.sub.domain.com';
            appConfig.jscheck.cookie.expiration = 60 * 60 * 24 * 30; // 30 days

            mid = require(midPath)(midConfig);

            var headers = {},

                req = {
                    url: '/search?p=whatever&js=0',
                    cookies: {
                        sB: 'vm=p&sh=1&rw=new&v=1'
                    }
                },

                res = {
                    setHeader: function (key, val) {
                        headers[key.toLowerCase()] = val;
                    }
                },

                next = function () {
                    A.areSame(headers.hasOwnProperty('set-cookie'), true);
                    A.areSame(0, headers['set-cookie'].indexOf('sB=vm=p&sh=1&rw=new&v=1&js=0;domain=.my.sub.domain.com;expires='));
                };

            mid(req, res, next);
        }
    }));

    YUITest.TestRunner.add(suite);
});
