const {createStore} = require('..');
const expect = require('chai').expect;

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
        }
    },
    auth: {
        state: {isLogined: false, user: {}},
        actions: {
            signin: ({state, commit}, user) => commit('AUTH_SIGNIN', user),
            signout: ({state, commit}) => commit('AUTH_SIGNOUT')
        },
        events: {
            'AUTH_SIGNIN': (state, user) => Object.assign(state, {isLogined: true, user}),
            'AUTH_SIGNOUT': (state) => Object.assign(state, {isLogined: false, user: {}}),
        }
    }
};

describe('ExStore test', function () {
    let store;

    beforeEach(function () {
        store = createStore(modules).attachServices({
            $api: {
                get: (url) => console.log('$api get ', url),
                post: (url, data) => console.log('$api post ', url, data),
            }
        })
    });

    it('Call actions increase', function () {
        let _actions = store.data.actions;
        let _state = store.data.state;
        let old = _state.counter.current

        _actions.increase();
        expect(_state.counter.current).to.be.above(old);
    });

    it('Call actions signin', function () {
        let _actions = store.data.actions;
        let _state = store.data.state;

        _actions.signin({fullname: 'Quang Ngô', email: 'nnquangit@gmail.com', token: '123456'});

        expect(true).equal(_state.auth.isLogined);
        expect('Quang Ngô').equal(_state.auth.user.fullname);
        expect('nnquangit@gmail.com').equal(_state.auth.user.email);
        expect('123456').equal(_state.auth.user.token);
    });

    it('Check base state', function () {
        let _state = store.data.state;

        expect(_state.counter.current).equal(modules.counter.state.current);
    });
});