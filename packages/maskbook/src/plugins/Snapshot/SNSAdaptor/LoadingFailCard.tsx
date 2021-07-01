import { Component } from 'react'
import { SnapshotCard } from './SnapshotCard'
import { Typography, Button } from '@material-ui/core'

export class LoadingFailCard extends Component<{ title: string; retry: () => void; isFullPluginDown?: boolean }> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    state: { error: Error | null } = { error: null }
    render() {
        if (this.state.error) {
            return this.props.isFullPluginDown ? (
                <>
                    <Typography color="textPrimary">Loading fail due to Snapshot api service breakdown.</Typography>
                    <Button
                        style={{ width: 100, marginTop: 16 }}
                        variant="outlined"
                        onClick={() => {
                            this.setState({ error: null })
                            this.props.retry()
                        }}>
                        Retry
                    </Button>
                </>
            ) : (
                <SnapshotCard title={this.props.title}>
                    <Typography color="textPrimary">Loading fail due to Snapshot api service breakdown.</Typography>
                    <Button
                        style={{ width: 100, marginTop: 16 }}
                        variant="outlined"
                        onClick={() => {
                            this.setState({ error: null })
                            this.props.retry()
                        }}>
                        Retry
                    </Button>
                </SnapshotCard>
            )
        }
        return this.props.children
    }
}
