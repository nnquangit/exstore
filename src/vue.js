import {getStore} from './core'

const store = getStore()

export const vueActions = (keys) => keys.reduce((a, c) => ({
    ...a,
    [c]: function (payload) {
        return this.$store.actions[c](payload)
    }
}), {storeAction: () => true})

export const vueGetters = (keys) => keys.reduce((a, c) => ({
    ...a,
    [c]: {
        get: function () {
            return this.$store.getters[c](store)
        },
        set: () => true
    }
}), {storeGetter: {get: () => true, set: () => true}})

export const connectVue = {
    install: function (Vue, options) {
        Vue.mixin({
            beforeCreate: function () {
                let $options = this.$options
                let $data = $options.data || (() => ({}))

                let watchStore = (
                    ($options.computed && !!$options.computed.storeGetter) ||
                    ($options.methods && !!$options.methods.storeAction)
                )

                this.$store = store

                if (watchStore) {
                    $options.data = (...ar) => ({...$data(...ar), $$store: store})
                }
            }
        })
    }
}
