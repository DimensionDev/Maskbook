import { Component, type PropsWithChildren } from 'react'
import { SnapshotCard } from './SnapshotCard.js'
import { Typography, Button, Box } from '@mui/material'
import { useSnapshotTrans } from '../locales/i18n_generated.js'
import { useSharedTrans } from '@masknet/shared'

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
            return this.props.isFullPluginDown ?
                    <Full
                        onClick={() => {
                            this.setState({ error: null })
                            this.props.retry()
                        }}
                    />
                :   <SnapshotCard title={this.props.title}>
                        <NotFull
                            onClick={() => {
                                this.setState({ error: null })
                                this.props.retry()
                            }}
                        />
                    </SnapshotCard>
        }
        return this.props.children
    }
}
function Full(props: { onClick: () => void }) {
    const t = useSnapshotTrans()
    const t2 = useSharedTrans()
    return (
        <Box style={{ textAlign: 'center', padding: 16 }}>
            <Typography textAlign="center" color="error">
                {t2.load_failed()}
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
                onClick={props.onClick}>
                {t2.reload()}
            </Button>
        </Box>
    )
}

function NotFull(props: { onClick: () => void }) {
    const t = useSnapshotTrans()
    const t2 = useSharedTrans()
    return (
        <Box style={{ textAlign: 'center' }}>
            <Typography color={(t) => t.palette.maskColor.publicMain}>{t.plugin_snapshot_load_failed()}</Typography>
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
                onClick={props.onClick}>
                {t2.retry()}
            </Button>
        </Box>
    )
}
