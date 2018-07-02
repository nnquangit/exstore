# exstore
App container for Javascript applications with built in state management, service container use for React,... 
 
[![Build Status](https://travis-ci.org/nnquangit/exstore.svg?branch=master)](https://travis-ci.org/nnquangit/exstore)
[![CircleCI](https://circleci.com/gh/nnquangit/exstore/tree/master.svg?style=svg)](https://circleci.com/gh/nnquangit/exstore/tree/master)
 
# Basic Usage
```javascript
import {createStore} from 'exstore'
import axios from 'axios'
import Cookies from 'js-cookie'
 
const $api = axios.create()
const $storage = {
    getItem: key => Cookies.get(key),
    setItem: (key, value) => Cookies.set(key, value, {expires: 3, secure: true}),
    removeItem: key => Cookies.remove(key)
}
 
const modules = {
    counter: {
        state: {current: 1},
        actions: {
            increase: ({state, commit}) => commit('COUNTER_INCREASE'),
            decrease: ({state, commit}) => commit('COUNTER_DECREASE')
        },
        mutations: {
            'COUNTER_INCREASE': (state) => state.current += 1,
            'COUNTER_DECREASE': (state) => state.current -= 1,
        },
        getters: {
            current: (state) => state.current,
        },
    }
};
 
const persitPlugins = (_store) => {
    let {$cookies} = _store.getServices()
    let saved = $cookies.getItem('storekey');

    if (saved) {
        _store.replaceState({..._store.getState(), auth: JSON.parse(saved)})
    }

    _store.subscribe((msg) => $cookies.setItem('storekey', JSON.stringify(_store.getState().auth)))
}
const logPlugins = (_store) => _store.subscribe((msg) => console.log(msg))
 
const store = createStore({modules})
    .attachPlugins([persitPlugins, logPlugins])
    .attachServices({$api, $storage})
 
//Listen for change
store.subscribe((msg) => console.log(getStateCapture()))
 
//Call action
store.actions.increase()
```

# Usage with react
```javascript
import React from 'react';
import {connectReact as connect} from 'exstore'
 
class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {current, increase, decrease} = this.props;

        return (<div>
            Counter is {current}
            <button type="button" onClick={increase}>+1</button>
            <button type="button" onClick={decrease}>-1</button>
        </div>)
    }
}
 
const state =  ({getters}) => ({
  current: getters.current()
})
 
const actions =  ({actions}) => ({
  increase: actions.increase,
  decrease: actions.decrease
})
 
export const Home = connect(state, actions)(HomePage)
```

## Tools
- [exstore-devtools](https://github.com/nnquangit/exstore-devtools) Devtools for exstore (coming soon)
- [react-ssr-jest](https://github.com/nnquangit/react-ssr-jest) Reactjs starter kit for ssr with webpack 4, exstore,...
