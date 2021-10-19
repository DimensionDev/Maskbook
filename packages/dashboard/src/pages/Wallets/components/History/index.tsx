import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { HistoryTable } from '../HistoryTable'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '24px',
    },
})

interface HistoryProps {
    selectedChainId: ChainId
}

export const History = memo<HistoryProps>(({ selectedChainId }) => {
    const { classes } = useStyles()
    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <HistoryTable selectedChainId={selectedChainId} />
        </ContentContainer>
    )
})
