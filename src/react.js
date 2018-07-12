import React from 'react'
import {getStore} from './core'

export function connectReact(state = () => ({}), services = () => ({})) {
    const _store = getStore()

    return (WrappedComponent) => {
        return class extends React.Component {
            _ismounted = false;

            constructor(props) {
                super(props)
                this.state = {state: state(_store), services: services(_store)}
                let snapshot = JSON.stringify(this.state.state)
                this.subscribe = _store.subscribe((msg) => {
                    let newstate = state(_store)
                    let newsnapshot = JSON.stringify(newstate)
                    if (snapshot !== newsnapshot) {
                        snapshot = newsnapshot
                        if (this._ismounted) {
                            this.setState({state: newstate})
                        } else {
                            this.state = newstate
                        }
                    }
                })
            }

            componentDidMount() {
                this._ismounted = true;
            }

            componentWillUnmount() {
                this._ismounted = false;
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
