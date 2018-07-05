const Vue = require('vue')
const {createStore, connectReact, connectVue, vueActions, vueGetters} = require('..')
const expect = require('chai').expect

const modules = {
    counter: {
        state: {current: 1},
        actions: {
            increase: ({state, commit}) => commit('COUNTER_INCREASE'),
            decrease: ({state, commit}) => commit('COUNTER_DECREASE')
        },
        mutations: {
            'COUNTER_INCREASE': (state) => state.current += 1,
            'COUNTER_DECREASE': (state) => state.current -= 1
        }
    },
    auth: {
        state: {isLogined: false, user: {}},
        actions: {
            signin: ({state, commit}, user) => commit('AUTH_SIGNIN', user),
            signout: ({state, commit}) => commit('AUTH_SIGNOUT')
        },
        mutations: {
            'AUTH_SIGNIN': (state, user) => Object.assign(state, {isLogined: true, user}),
            'AUTH_SIGNOUT': (state) => Object.assign(state, {isLogined: false, user: {}})
        }
    }
}

describe('ExStore js test', function () {
    let store

    beforeEach(function () {
        store = createStore({modules})
    })

    it('Call actions increase', function () {
        let {actions: _actions, state: _state} = store
        let old = _state.counter.current

        _actions.increase()
        expect(_state.counter.current).to.be.above(old)
    })

    it('Call actions signin', function () {
        let {actions: _actions, state: _state} = store

        _actions.signin({fullname: 'Quang Ngô', email: 'nnquangit@gmail.com', token: '123456'})

        expect(true).equal(_state.auth.isLogined)
        expect('Quang Ngô').equal(_state.auth.user.fullname)
        expect('nnquangit@gmail.com').equal(_state.auth.user.email)
        expect('123456').equal(_state.auth.user.token)
    })

    it('Check base state', function () {
        let {actions: _actions, state: _state} = store

        expect(_state.counter.current).equal(modules.counter.state.current)
    })
})

describe('ExStore vue test', function () {
    let store

    beforeEach(function () {
        store = createStore({modules})
    })

    it('Call actions connect', function () {
        expect(() => {
            Vue.use(connectVue)
            new Vue({
                computed: vueGetters(['currentUser', 'isLoggedIn']),
                methods: vueActions(['signin', 'signout']),
                template: '<div>{{ hi }}</div>'
            })
        }).to.not.throw();
    })
})

describe('ExStore react test', function () {
    let store

    beforeEach(function () {
        store = createStore({modules})
    })

    it('Call actions connect', function () {
        expect(() => {
            connectReact(() => {})
        }).to.not.throw();
    })
})