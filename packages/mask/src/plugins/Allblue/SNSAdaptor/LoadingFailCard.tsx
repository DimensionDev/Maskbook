import { Component } from 'react'
import { AllblueCard } from './AllblueCard'
import { Typography, Button } from '@mui/material'

export class LoadingFailCard extends Component<{ title: string; retry: () => void; isFullPluginDown?: boolean }> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    override state: { error: Error | null } = { error: null }
    override render() {
        if (this.state.error) {
            return this.props.isFullPluginDown ? (
                <>
                    <Typography color="textPrimary">Loading fails due to Allblue API service breakdown.</Typography>
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
                <AllblueCard title={this.props.title}>
                    <Typography color="textPrimary">Loading fails due to Allblue API service breakdown.</Typography>
                    <Button
                        style={{ width: 100, marginTop: 16 }}
                        variant="outlined"
                        onClick={() => {
                            this.setState({ error: null })
                            this.props.retry()
                        }}>
                        Retry
                    </Button>
                </AllblueCard>
            )
        }
        return this.props.children
    }
}
