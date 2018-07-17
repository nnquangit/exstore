import React from 'react'
import {getStore} from './core'

export function connectReact(state = () => ({}), services = () => ({})) {
    const _store = getStore()

    return (WrappedComponent) => {
        return class extends React.Component {

            constructor(props) {
                super(props)
                this.state = {state: state(_store), services: services(_store)}
                let snapshot = JSON.stringify(this.state.state)
                this.exstore = _store.subscribe((msg) => {
                    let newstate = state(_store)
                    let newsnapshot = JSON.stringify(newstate)
                    if (snapshot !== newsnapshot) {
                        snapshot = newsnapshot
                        this.updater.enqueueSetState(this, {state: newstate});
                    }
                })
            }

            componentWillUnmount() {
                if (this.exstore) {
                    this.exstore.unsubscribe()
                }
            }

            render() {
                return <WrappedComponent {...this.props} {...this.state.state} {...this.state.services}/>
            }
        }
    }
}
