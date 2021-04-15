import { Component } from 'react'
import { SnapshotCard } from './SnapshotCard'
import { Typography } from '@material-ui/core'

export class NetworkFail extends Component<{ title: string }> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    state: { error: Error | null } = { error: null }
    render() {
        if (this.state.error) {
            return (
                <SnapshotCard title={this.props.title}>
                    <Typography>Loading fail due to api service error</Typography>
                </SnapshotCard>
            )
        }
        return this.props.children
    }
}
