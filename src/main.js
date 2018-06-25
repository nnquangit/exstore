import * as Rx from "rxjs";
import React from 'react';

const store = new Rx.Subject();
Object.assign(store, {
    state: {}, actions: {}, mutations: {}, getters: {},
    services: {}, plugins: [], middlewares: []
});
store.attachModules = attachModules;
//State
store.getState = getState;
store.getStateCapture = getStateCapture;
store.replaceState = replaceState;
//Services
store.getServices = getServices;
store.attachServices = attachServices;
//Plugins
store.attachPlugins = attachPlugins;
//Middlewares
store.attachMiddlewares = attachMiddlewares;
store.applyMiddlewares = applyMiddlewares;
store.runMiddlewares = runMiddlewares;

export function getStore() {
    return store
}

export function getState() {
    return getStore().state;
}

export function getStateCapture() {
    return JSON.parse(JSON.stringify(getStore().state));
}

export function replaceState(state) {
    const _store = getStore();

    _store.state = {...state}
    _store.next({mutation: 'state:replace', state: _store.getStateCapture()})

    return _store;
}

export function createStore({modules, services, plugins, middlewares}) {
    const _store = getStore();

    if (modules) {
        _store.attachModules(modules)
    }

    if (services) {
        _store.attachServices(services)
    }

    if (plugins) {
        _store.attachPlugins(plugins)
    }

    if (middlewares) {
        _store.attachMiddlewares(middlewares)
    }

    return _store;
}

export function applyMiddlewares() {
    const _store = getStore();

    _store.runMiddlewares(_store.middlewares)
}

export function runMiddlewares(middlewares) {
    if (!middlewares.length) {
        return
    }

    return () => middlewares[0](getStore(), middlewares[1]
        ? runMiddlewares(middlewares.slice(1))
        : () => ({})
    )
}

export function attachModules(modules) {
    const _store = getStore();

    Object.keys(modules).map((module) => {

        _store.state[module] = {...modules[module].state};

        if (modules[module].mutations) {
            Object.keys(modules[module].mutations).map(mutation => {
                _store.mutations[mutation] = (payload) => {
                    modules[module].mutations[mutation](_store.state[module], payload)
                    _store.next({mutation: mutation, state: _store.getStateCapture()})
                }
            })
        }
        if (modules[module].getters) {
            Object.keys(modules[module].getters).map(k => {
                _store.getters[k] = (payload) => modules[module].getters[k](
                    {..._store.state[module]},
                    payload
                )
            })
        }
        if (modules[module].actions) {
            Object.keys(modules[module].actions).map(k => {
                _store.actions[k] = (payload) => modules[module].actions[k]({
                    store: _store,
                    state: {..._store.state[module]},
                    commit: (mutation, payloads) => _store.mutations[mutation](payloads)
                }, payload)
            })
        }
    })

    return _store;
}

export function getServices() {
    return getStore().services;
}

export function attachServices(services) {
    const _store = getStore();

    Object.assign(_store.services, services)

    return _store;
}

export function attachPlugins(plugins) {
    const _store = getStore();

    if (plugins.length) {
        plugins.map(plugin => {
            _store.plugins.push(plugin)
            plugin(_store)
        })
    }

    return _store;
}

export function attachMiddlewares(middlewares) {
    const _store = getStore();

    if (middlewares.length) {
        _store.middlewares = [...middlewares, ..._store.middlewares]
    }

    return _store;
}

export function connectReact(mapToProps = {}) {
    const _store = getStore();

    return (WrappedComponent) => {
        return class extends React.Component {
            constructor(props) {
                super(props);
                this.state = mapToProps(_store)
                this.subscribe = _store.subscribe((msg) => this.setState(mapToProps(_store)))
            }

            componentWillUnmount() {
                this.subscribe.unsubscribe()
            }

            render() {
                return <WrappedComponent {...this.props} {...this.state}/>;
            }
        }
    }
}
