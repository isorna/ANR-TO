/*jslint indent: 4, nomen: true */
/*global document, window, $, _, console, Backbone */

// START encapsulation
(function (poGlobals) {
    'use strict';
    
    /*
     * APP object declaration
     */
    poGlobals.goANRTO = {
        cache: {
            views: {},
            database: {},
            request: {},
            schema: {
                player: {
                    name: '',
                    points: 0,
                    runnerWins: 0,
                    runnerAgendaPoints: 0,
                    corpWins: 0,
                    corpAgendaPoints: 0
                }
            }
        },
        initialize: function () {
            // VIEWS            
            poGlobals.goANRTO.cache.views.home = new (Backbone.View.extend({
                id: 'homeWrapper',
                className: 'pageWrapper',
                template: $('#homeTemplate').html(),
                viewRendered: false,
                initialize: function () {},
                render: function () {
                    var hVars = {
                        cHeaderTitle: 'ANR: TO'
                    };
                    
                    $('.pageWrapper').hide();
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).appendTo('body');
                    } else {
                        this.$el.show();
                    }
                    
                    return this;
                }
            }));
            poGlobals.goANRTO.cache.views.newPlayer = new (Backbone.View.extend({
                id: 'newPlayerWrapper',
                className: 'pageWrapper',
                template: $('#newPlayerTemplate').html(),
                viewRendered: false,
                events: {
                    'submit #newPlayerForm': 'saveNewPlayer'
                },
                initialize: function () {},
                render: function () {
                    var hVars = {
                        cHeaderTitle: 'ANR: TO'
                    };
                    
                    $('.pageWrapper').hide();
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).appendTo('body');
                    } else {
                        this.$el.show();
                    }
                    
                    return this;
                },
                saveNewPlayer: function (poEvent) {
                    var hNewPLayer = {name: $('#newPlayerName').val(), points: 0, runnerWins: 0, runnerAgendaPoints: 0, corpWins: 0, corpAgendaPoints: 0},
                        oTransaction = poGlobals.goANRTO.cache.database.transaction(['players'], 'readwrite'),
                        oObjectStore = oTransaction.objectStore('players'),
                        oRequest = oObjectStore.put(hNewPLayer);
                    
                    oRequest.onsuccess = function (poEvent) {
                        console.log('[OK]', hNewPLayer.name + ' saved!');
                        // @todo: show player sheet after saving it
                        poGlobals.goANRTO.cache.router.navigate('players', {trigger: true});
                    };
                    
                    poEvent.preventDefault();
                }
            }));
            poGlobals.goANRTO.cache.views.players = new (Backbone.View.extend({
                id: 'playersWrapper',
                className: 'pageWrapper',
                template: $('#playersTemplate').html(),
                viewRendered: false,
                initialize: function () {},
                render: function (paPlayers) {
                    var hVars = {
                        cHeaderTitle: 'ANR: TO',
                        aPlayers: paPlayers
                    };
                    
                    $('.pageWrapper').hide();
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).appendTo('body');
                    } else {
                        this.$el.show();
                    }
                    
                    return this;
                }
            }));
            
            // ROUTER            
            poGlobals.goANRTO.cache.router = new (Backbone.Router.extend({
                routes: {
                    'C:/xampp/htdocs/ANR-TO/index.html': 'home', // LOCAL ENV PATCH
                    '': 'home',
                    '/': 'home',
                    'index.html': 'home',
                    'players(/:player)': 'players',
                    'new-player': 'newplayer',
                    '*path': '404'
                },
                home: function () {
                    poGlobals.goANRTO.cache.views.home.render();
                },
                players: function (pcPlayer) {
                    console.log('goANRTO.cache.database');
                    /*
                    var oObjectStore = poGlobals.goANRTO.cache.database.transaction('players').objectStore('players');
                    oObjectStore.openCursor().onsuccess = function (poEvent) {
                        var oCursor = poEvent.target.result;
                        
                        if (oCursor) {
                            console.log(oCursor.key, oCursor.value);
                            oCursor.continue();
                        }
                    };
                    
                    console.log('[PLAYERS]', pcPlayer);*/
                                        
                    //poGlobals.goANRTO.cache.views.players.render([]);
                },
                newplayer: function () {
                    poGlobals.goANRTO.cache.views.newPlayer.render();
                },
                404: function (pcPath) {
                    console.log('[404]', pcPath);
                }
            }));
    
            // HISTORY
            Backbone.history.start({pushState: true, hashChange: true});
    
            // CAPTURE pushState
            $(document).on("click", "a[href^='/']", function (poEvent) {
                var cUrl = '';
                
                if (!poEvent.altKey && !poEvent.ctrlKey && !poEvent.metaKey && !poEvent.shiftKey) {
                    poEvent.preventDefault();
                    cUrl = $(poEvent.currentTarget).attr("href").replace(/^\//, "");
                    poGlobals.goANRTO.cache.router.navigate(cUrl, {trigger: true});
                }
            });
            
            // IndexedDB
            // @read: http://stackoverflow.com/questions/9384128/how-to-delete-indexeddb-in-chrome
            // @read: https://developer.mozilla.org/en/docs/IndexedDB
            // poGlobals.indexedDB.deleteDatabase('ANRTO')
            poGlobals.goANRTO._indexedDBSupport();
            
            if (poGlobals.indexedDB) {
                poGlobals.goANRTO.cache.request = poGlobals.indexedDB.open('ANRTO', 1);
                poGlobals.goANRTO.cache.request.onerror = function (poEvent) {
                    console.error('[ERROR]', poEvent.target.errorCode);
                };
                poGlobals.goANRTO.cache.request.onsuccess = function (poEvent) {
                    // @todo: why does it make a new cache.request each time the app is routed?
                    console.log('PASA', goANRTO.cache.request.result);
                    goANRTO.cache.database = goANRTO.cache.request.result;
                    console.log('PASA 2', goANRTO.cache.database);
                };
                poGlobals.goANRTO.cache.request.onupgradeneeded = function (poEvent) {
                    var oDB = poEvent.target.result,
                        oObjectStorePlayers = oDB.createObjectStore('players', {keyPath: 'id', autoIncrement: true}),
                        oObjectStoreTournaments = oDB.createObjectStore('tournaments', {keyPath: 'id', autoIncrement: true}),
                        oObjectStoreMatches = oDB.createObjectStore('matches', {keyPath: 'id', autoIncrement: true});
                };
            }
        }
    };

    /* 
     * Get file by ajax method
     * pcDataType: 'script', 'text', 'html', 'json', 'jsonp', 'xml'
     * @todo: decide if we'll allow non-cachable scripts with cache parameter:
     * cache: (pcDataType == 'script') ? true : false
     * @todo: decide if we send some log message in case of an error
     */
    poGlobals.goANRTO._GetURL = function (pcURL, pbAsync, pfCallback, pcDataType) {
        poGlobals.goANRTO.rData = 'Failed to load URL: ' + pcURL;
        pcDataType = pcDataType || 'text';
    
        $.ajax({
            async: pbAsync,
            url: pcURL,
            dataType: pcDataType,
            cache: true,
            success: pfCallback || function (poResponse) {
                poGlobals.goANRTO.rData = poResponse;
            },
            error: function (poResponse) {
                console.error('[ERROR] ' + poGlobals.goANRTO.rData, poResponse);
            }
        });
    
        return poGlobals.goANRTO.rData;
    };
	
    /*
     * indexedDB support
     * @read: http://www.sitepoint.com/creating-a-notepad-app-with-indexeddb/
     */
    poGlobals.goANRTO._indexedDBSupport = function () {
        poGlobals.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        poGlobals.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        poGlobals.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        
        if (!poGlobals.indexedDB) {
            console.error('[ERROR] No IndexedDB support');
        } else {
            console.info('[OK] IndexedDB support detected');
        }
    };
    
    /*
     * START document.ready()
     */
    $(document).ready(function () {
        // APP initialization
        poGlobals.goANRTO.initialize();
    });
    // END encapsulation
}(this));
