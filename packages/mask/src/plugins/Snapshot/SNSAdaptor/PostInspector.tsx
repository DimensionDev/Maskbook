import { SnapshotContext } from '../context'
import { getProposalIdentifier } from './helpers'
import { Snapshot } from './Snapshot'
import { LoadingFailCard } from './LoadingFailCard'
import { useRetry } from './hooks/useRetry'
import { ThemeProvider } from '@mui/material'
import { useClassicMaskSNSPluginTheme } from '../../../utils'

export interface PostInspectorProps {
    url: string
}

export function PostInspector(props: PostInspectorProps) {
    const identifier = getProposalIdentifier(props.url)
    const retry = useRetry()
    const theme = useClassicMaskSNSPluginTheme()
    return (
        <ThemeProvider theme={theme}>
            <SnapshotContext.Provider value={identifier}>
                <LoadingFailCard title="" isFullPluginDown retry={retry}>
                    <Snapshot />
                </LoadingFailCard>
            </SnapshotContext.Provider>
        </ThemeProvider>
    )
}
