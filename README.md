# exstore
Extend store container for Javascript applications (React,...)

# Basic Usage
```javascript
import {createStore, getStore, attachServices, getServices, getStateCapture} from 'exstore'
import axios from 'axios'
import Cookies from 'js-cookie'
 
const $api = axios.create()
const $storage = {
    getItem: key => Cookies.get(key),
    setItem: (key, value) => Cookies.set(key, value, { expires: 3, secure: true }),
    removeItem: key => Cookies.remove(key)
}
 
const modules = {
    counter: {
        state: {current: 1},
        actions: {
            increase: ({state, commit}) => commit('COUNTER_INCREASE'),
            decrease: ({state, commit}) => commit('COUNTER_DECREASE')
        },
        events: {
            'COUNTER_INCREASE': (state) => state.current += 1,
            'COUNTER_DECREASE': (state) => state.current -= 1,
        },
        getters: {
            current: (state) => state.current,
        },
    }
};
  
const persitPlugins = (_store) => {
    //Call end of createStore
    _store.data.state = {..._store.data.state, more: $storage.setItem('key')}
    
    //Trigger for change state
    _store.subscribe((msg) => {
        let {$storage: _$storage} = _store.getServices()
        let {more} = _store.getStateCapture()
        _$storage.setItem('key', more)
    }))
}
const logPlugins = (_store) => _store.subscribe((msg) => console.log(msg))
  
const store = createStore(modules, [persitPlugins, logPlugins]).attachServices({$api})
//or
attachServices({$storage})
 
//Listen for change
store.subscribe((msg) => console.log(getStateCapture()))
 
//Call action
store.data.actions.increase()
```

# Usage with react
```javascript
import React from 'react';
import {createStore, getStore, attachServices, getServices, connectReact as connect} from 'exstore'
 
class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {current, increase, decrease} = this.props;

        return (<div>
            Counter is {current()}
            <button type="button" onClick={increase}>+1</button>
            <button type="button" onClick={decrease}>-1</button>
        </div>)
    }
}

export const Home = connect(({state, actions, getters}) => ({...state, ...actions, ...getters}))(HomePage)
```