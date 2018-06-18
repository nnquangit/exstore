'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Rx = require('rxjs');

const subject = new Rx.Subject();

function getStore() {
    return subject
}

function getState() {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use getState";
    }

    return _data.state;
}

function getStateCapture() {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use getStateCapture";
    }

    return JSON.parse(JSON.stringify(_data.state));
}

function replaceState(state) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use replaceState";
    }

    _data.state = {...state};
    subject.next({event: 'state:replace', state: _store.getStateCapture()});

    return _store;
}

function createStore(mods, plugins = []) {
    const _store = getStore();

    _store.data = {
        state: {}, actions: {}, events: {}, getters: {},
        services: {}, plugins: []
    };

    if (plugins.length) {
        _store.data.plugins = [..._store.data.plugins, ...plugins];
    }

    _store.getState = getState;
    _store.getStateCapture = getStateCapture;
    _store.replaceState = replaceState;
    _store.attachModdules = attachModdules;
    _store.attachServices = attachServices;

    _store.attachModdules(mods);

    _store.data.plugins.map(plugin => plugin(_store));

    return _store;
}

function attachModdules(modules) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use attachModdules";
    }

    Object.keys(modules).map((module) => {

        _data.state[module] = {...modules[module].state};

        if (modules[module].events) {
            Object.keys(modules[module].events).map(event => {
                _data.events[event] = (payload) => {
                    modules[module].events[event](_data.state[module], payload);
                    subject.next({event: event, state: _store.getStateCapture()});
                };
            });
        }
        if (modules[module].getters) {
            Object.keys(modules[module].getters).map(k => {
                _data.getters[k] = (payload) => modules[module].getters[k](
                    {..._data.state[module]},
                    payload
                );
            });
        }
        if (modules[module].actions) {
            Object.keys(modules[module].actions).map(k => {
                _data.actions[k] = (payload) => modules[module].actions[k]({
                    commit: (event, payloads) => _data.events[event](payloads),
                    state: {..._data.state[module]},
                    rootState: {..._data, state: _store.getStateCapture()}
                }, payload);
            });
        }
    });

    return _store;
}

function attachServices(services) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use attachServices";
    }

    Object.assign(_data.services, services);

    return _store;
}

exports.getStore = getStore;
exports.getState = getState;
exports.getStateCapture = getStateCapture;
exports.replaceState = replaceState;
exports.createStore = createStore;
exports.attachModdules = attachModdules;
exports.attachServices = attachServices;
