import { Component, PropsWithChildren } from 'react'
import { SnapshotCard } from './SnapshotCard'
import { Typography, Button, Box } from '@mui/material'

export class LoadingFailCard extends Component<
    PropsWithChildren<{ title: string; retry: () => void; isFullPluginDown?: boolean }>
> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    override state: { error: Error | null } = { error: null }
    override render() {
        if (this.state.error) {
            return this.props.isFullPluginDown ? (
                <Box style={{ textAlign: 'center', padding: 16 }}>
                    <Typography textAlign="center" color="error">
                        Loading fails due to Snapshot API service breakdown.
                    </Typography>
                    <Button
                        style={{
                            width: 254,
                            height: 40,
                            backgroundColor: '#07101B',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 700,
                            marginBottom: 4,
                            marginTop: 32,
                        }}
                        onClick={() => {
                            this.setState({ error: null })
                            this.props.retry()
                        }}>
                        Retry
                    </Button>
                </Box>
            ) : (
                <SnapshotCard title={this.props.title}>
                    <Typography color="textPrimary">Loading fails due to Snapshot API service breakdown.</Typography>
                    <Button
                        style={{ width: 100, marginTop: 16 }}
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
