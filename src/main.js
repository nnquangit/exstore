import * as Rx from "rxjs";
import React from 'react';

const subject = new Rx.Subject();

export function getStore() {
    return subject
}

export function getState() {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use getState";
    }

    return _data.state;
}

export function getStateCapture() {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use getStateCapture";
    }

    return JSON.parse(JSON.stringify(_data.state));
}

export function replaceState(state) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use replaceState";
    }

    _data.state = {...state}
    subject.next({event: 'state:replace', state: _store.getStateCapture()})

    return _store;
}

export function createStore(mods, services, plugins = []) {
    const _store = getStore();

    _store.data = {
        state: {}, actions: {}, events: {}, getters: {},
        services: {}, plugins: []
    }

    _store.getState = getState;
    _store.getStateCapture = getStateCapture;
    _store.replaceState = replaceState;
    _store.attachModules = attachModules;
    _store.getServices = getServices;
    _store.attachServices = attachServices;
    _store.attachPlugins = attachPlugins;

    _store.attachModules(mods)

    if (typeof services === 'Object') {
        _store.attachServices(services)
    }

    if (plugins.length) {
        _store.attachPlugins(plugins)
    }

    return _store;
}

export function attachModules(modules) {
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
                    modules[module].events[event](_data.state[module], payload)
                    subject.next({event: event, state: _store.getStateCapture()})
                }
            })
        }
        if (modules[module].getters) {
            Object.keys(modules[module].getters).map(k => {
                _data.getters[k] = (payload) => modules[module].getters[k](
                    {..._data.state[module]},
                    payload
                )
            })
        }
        if (modules[module].actions) {
            Object.keys(modules[module].actions).map(k => {
                _data.actions[k] = (payload) => modules[module].actions[k]({
                    commit: (event, payloads) => _data.events[event](payloads),
                    state: {..._data.state[module]},
                    rootState: {..._data, state: _store.getStateCapture()}
                }, payload)
            })
        }
    })

    return _store;
}

export function getServices(services) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use attachServices";
    }

    return _data.services;
}

export function attachServices(services) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use attachServices";
    }

    Object.assign(_data.services, services)

    return _store;
}


export function attachPlugins(plugins) {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use attachServices";
    }

    if (plugins.length) {
        plugins.map(plugin => {
            _data.plugins.push(plugin)
            plugin(_store)
        })
    }

    return _store;
}

export const connectReact = (mapToProps = {}) => {
    const _store = getStore();
    const _data = _store.data;

    if (!_store.data) {
        throw "Store did not created ! Run createStore before use connect";
    }

    return (WrappedComponent) => {
        return class extends React.Component {
            constructor(props) {
                super(props);
                this.state = mapToProps(_data)
                this.trigger = _store.subscribe((msg) => this.setState(mapToProps(_data)))
            }

            componentWillUnmount() {
                this.trigger.unsubscribe()
            }

            render() {
                return
            <
                WrappedComponent
                {...
                    this.state
                }
                />;
            }
        };
    }
}