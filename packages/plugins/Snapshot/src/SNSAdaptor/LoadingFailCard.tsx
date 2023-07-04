import { Component, type PropsWithChildren } from 'react'
import { SnapshotCard } from './SnapshotCard.js'
import { Typography, Button, Box } from '@mui/material'
import { Trans } from 'react-i18next'

export class LoadingFailCard extends Component<
    PropsWithChildren<{
        title: string
        retry: () => void
        isFullPluginDown?: boolean
    }>
> {
    static getDerivedStateFromError(error: unknown) {
        return { error }
    }
    override state: {
        error: Error | null
    } = { error: null }
    override render() {
        if (this.state.error) {
            return this.props.isFullPluginDown ? (
                <Box style={{ textAlign: 'center', padding: 16 }}>
                    <Typography textAlign="center" color="error">
                        <Trans i18nKey="load_failed" />
                    </Typography>
                    <Button
                        sx={{
                            width: 254,
                            height: 40,
                            backgroundColor: (t) => t.palette.maskColor.publicMain,
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 700,
                            marginBottom: 0.5,
                            marginTop: 4,
                            '&:hover': {
                                backgroundColor: (t) => t.palette.maskColor.publicMain,
                            },
                        }}
                        variant="roundedContained"
                        onClick={() => {
                            this.setState({ error: null })
                            this.props.retry()
                        }}>
                        <Trans i18nKey="reload" />
                    </Button>
                </Box>
            ) : (
                <SnapshotCard title={this.props.title}>
                    <Box style={{ textAlign: 'center' }}>
                        <Typography color={(t) => t.palette.maskColor.publicMain}>
                            <Trans i18nKey="plugin_snapshot_load_failed" />
                        </Typography>
                        <Button
                            variant="roundedContained"
                            sx={{
                                width: 254,
                                height: 40,
                                backgroundColor: (theme) => theme.palette.maskColor.publicMain,
                                color: (theme) => theme.palette.maskColor.white,
                                fontSize: 14,
                                fontWeight: 700,
                                marginBottom: 4,
                                marginTop: 2,
                                '&:hover': {
                                    backgroundColor: (theme) => theme.palette.maskColor.publicMain,
                                },
                            }}
                            onClick={() => {
                                this.setState({ error: null })
                                this.props.retry()
                            }}>
                            <Trans i18nKey="retry" />
                        </Button>
                    </Box>
                </SnapshotCard>
            )
        }
        return this.props.children
    }
}
