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
 
const persit = (_store) => {
    let {$storage} = _store.getServices()
    let saved = $storage.getItem('storekey');

    if (saved) {
        _store.replaceState({..._store.getState(), auth: JSON.parse(saved)})
    }

    _store.subscribe((msg) => $storage.setItem('storekey', JSON.stringify(_store.getState().auth)))
}
const log = (_store) => _store.subscribe((msg) => console.log(msg))
const remoteControl = (_store) => {//...})
const remoteDebug = (_store) => {//...})
const devTool = (_store) => {//...})
 
const store = createStore({modules})
    .attachServices({$api, $storage})
    .attachPlugins([persit, log, remoteControl, remoteDebug, devTool])
 
//Listen for change
store.subscribe((msg) => console.log(getStateCapture()))
 
//Call action
store.actions.increase()
```

# Usage with React.js or Native
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

# Usage with Vue.js or Native
```javascript
import {connectVue, vueGetters, vueActions} from 'exstore'
 
Vue.use(connectVue)
 
new Vue({
    computed: {...vueGetters(['currentUser', 'isLoggedIn'])},
    methods: {...vueActions(['signin', 'signout'])},
    template: '<div>{{ hi }}</div>'
})
```

## Tools
- [exstore-devtools](https://github.com/nnquangit/exstore-devtools) Devtools for exstore (coming soon)
- [react-ssr-jest](https://github.com/nnquangit/react-ssr-jest) Reactjs starter kit with exstore, jest, webpack 4, ssr,...
- [vue-ssr-jest](https://github.com/nnquangit/vue-ssr-jest) Vue 2.x starter kit with exstore, jest, webpack 4, ssr,...
