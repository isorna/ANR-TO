/*jslint indent: 4, nomen: true */
/*global document, window, $, _, console, Backbone */

// START encapsulation
(function (poGlobals) {
    'use strict';
    
    /*
     * APP CACHE REFRESH
     * Ask the user to reload app when a new version is available.
     */
    if (poGlobals.applicationCache) {
        poGlobals.applicationCache.addEventListener('updateready', function () {
            if (poGlobals.confirm('An update is available. Reload now?')) {
                poGlobals.location.reload();
            }
        });
    }
    
    /*
     * APP object declaration
     */
    poGlobals.goANRTO = {
        cache: {
            constants: {
                PAGE_TITLE: 'THE.TOOLBOX'
            },
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
            poGlobals.goANRTO.cache.views.menu = new (Backbone.View.extend({
                id: 'menuWrapper',
                tagname: 'nav',
                className: 'menu',
                template: $('#menuTemplate').html(),
                viewRendered: false,
                initialize: function () {},
                render: function () {
                    var hVars = {
                        cHeaderTitle: poGlobals.goANRTO.cache.constants.PAGE_TITLE
                    };
                    
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).prependTo('body .demo');
                    } else {
                        //this.viewRendered = true;
                        //this.$el.show();
                    }
                    
                    return this;
                }
            }));
            poGlobals.goANRTO.cache.views.home = new (Backbone.View.extend({
                id: 'homeWrapper',
                tagname: 'div',
                className: 'app',
                template: $('#homeTemplate').html(),
                viewRendered: false,
                initialize: function () {},
                render: function () {
                    var hVars = {
                        cHeaderTitle: poGlobals.goANRTO.cache.constants.PAGE_TITLE
                    };
                    
                    // @todo: ADD 'with-subheader' CLASS
                    // ...
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).appendTo('body .demo');
                    } else {
                        this.$el.show();
                    }
                    
                    return this;
                }
            }));
            poGlobals.goANRTO.cache.views.newPlayer = new (Backbone.View.extend({
                id: 'newPlayerWrapper',
                tagname: 'div',
                className: 'app',
                template: $('#newPlayerTemplate').html(),
                viewRendered: false,
                events: {
                    'click #submitNewPlayerForm': 'saveNewPlayer',
                    'submit #newPlayerForm': 'saveNewPlayer'
                },
                initialize: function () {},
                render: function () {
                    var hVars = {
                        cHeaderTitle: poGlobals.goANRTO.cache.constants.PAGE_TITLE
                    };
                    
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).appendTo('body .demo');
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
                        //console.log('[OK]', hNewPLayer.name + ' saved!');
                        // @todo: show player sheet after saving it?
                        poGlobals.goANRTO.cache.router.navigate('players', {trigger: true});
                    };
                    
                    poEvent.preventDefault();
                }
            }));
            poGlobals.goANRTO.cache.views.players = new (Backbone.View.extend({
                id: 'playersWrapper',
                tagname: 'div',
                className: 'app',
                template: $('#playersTemplate').html(),
                viewRendered: false,
                initialize: function () {},
                render: function (paPlayers) {
                    var hVars = {
                        cHeaderTitle: poGlobals.goANRTO.cache.constants.PAGE_TITLE,
                        aPlayers: paPlayers
                    };
                    
                    if (!this.viewRendered) {
                        this.$el.html(_.template(this.template, hVars)).appendTo('body .demo');
                    } else {
                        this.$el.show();
                    }
                    
                    return this;
                }
            }));
            
            // ROUTER            
            poGlobals.goANRTO.cache.router = new (Backbone.Router.extend({
                routes: {
                    '': 'home',
                    'index.html': 'home',
                    'navigation': 'navigation',
                    'players(/:players)': 'players',
                    'new-player': 'newplayer',
                    '*path': '404'
                },
                home: function () {
                    $('a.header-button').attr('href', '/navigation').removeClass('active');
                    //$('#menuWrapper, .app').remove();
                    $('#menuWrapper').removeClass('menu').addClass('hidden-menu');
                    $('.app').remove();
                    poGlobals.goANRTO.cache.views.home.render();
                },
                navigation: function () {
                    $('a.header-button').attr('href', '/').addClass('active');
                    // navigation doesn't remove '.app' layers
                    poGlobals.goANRTO.cache.views.menu.render();
                    $('#menuWrapper').removeClass('hidden-menu').addClass('menu');
                    $('.to-' + $('.app').attr('id')).addClass('active');
                },
                players: function (pcPlayer) {//console.log('OK');
                    $('a.header-button').attr('href', '/navigation').removeClass('active');
                    //$('#menuWrapper, .app').remove();
                    $('#menuWrapper').removeClass('menu').addClass('hidden-menu');
                    $('.app').remove();
                    var oObjectStore = poGlobals.goANRTO.cache.database.transaction('players').objectStore('players'),
                        aPlayers = [];
                    oObjectStore.openCursor().onsuccess = function (poEvent) {
                        var oCursor = poEvent.target.result;
                        
                        if (pcPlayer !== null) {
                            // show single player sheet
                        } else {
                            if (oCursor) {
                                aPlayers[aPlayers.length] = oCursor.value;
                                oCursor.continue();
                            } else {
                                poGlobals.goANRTO.cache.views.players.render(aPlayers);
                            }
                        }
                    };
                },
                newplayer: function () {
                    $('a.header-button').attr('href', '/navigation').removeClass('active');
                    //$('#menuWrapper, .app').remove();
                    $('#menuWrapper').removeClass('menu').addClass('hidden-menu');
                    $('.app').remove();
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
        //var _indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        //poGlobals.indexedDB = _indexedDB;
        if (!window.indexedDB) {
            poGlobals.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        }
        poGlobals.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        poGlobals.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        
        if (!poGlobals.indexedDB) {
            console.error('[ERROR] No IndexedDB support');
        } else {
            // console.info('[OK] IndexedDB support detected');
        }
    };
    
    /*
     * START document.ready()
     */
    $(document).ready(function () {
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
                poGlobals.goANRTO.cache.database = poGlobals.goANRTO.cache.request.result;
            };
            poGlobals.goANRTO.cache.request.onupgradeneeded = function (poEvent) {
                var oDB = poEvent.target.result,
                    oObjectStorePlayers = oDB.createObjectStore('players', {keyPath: 'id', autoIncrement: true}),
                    oObjectStoreTournaments = oDB.createObjectStore('tournaments', {keyPath: 'id', autoIncrement: true}),
                    oObjectStoreMatches = oDB.createObjectStore('matches', {keyPath: 'id', autoIncrement: true});
            };
        }
        
        // APP initialization
        poGlobals.goANRTO.initialize();
    });
    // END encapsulation
}(this));
