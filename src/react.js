import React from 'react'
import {getStore} from './core'

export function connectReact(state = () => ({}), services = () => ({})) {
    const _store = getStore()

    return (WrappedComponent) => {
        return class extends React.Component {
            constructor(props) {
                super(props)
                this.state = {state: state(_store), services: services(_store)}
            }

            UNSAFE_componentWillMount() {
                let snapshot = JSON.stringify(this.state.state)
                this.subscribe = _store.subscribe((msg) => {
                    let newstate = state(_store)
                    let newsnapshot = JSON.stringify(newstate)
                    if (snapshot !== newsnapshot) {
                        snapshot = newsnapshot
                        this.setState({state: newstate})
                    }
                })
            }

            componentWillUnmount() {
                if (this.subscribe) {
                    this.subscribe.unsubscribe()
                }
            }

            render() {
                return <WrappedComponent {...this.props} {...this.state.state} {...this.state.services}/>
            }
        }
    }
}
