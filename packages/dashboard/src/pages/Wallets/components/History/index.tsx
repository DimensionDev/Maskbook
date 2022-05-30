import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { HistoryTable } from '../HistoryTable'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

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
    selectedChainId: Web3Helper.ChainIdAll
}

export const History = memo<HistoryProps>(({ selectedChainId }) => {
    const { classes } = useStyles()
    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <HistoryTable selectedChainId={selectedChainId} />
        </ContentContainer>
    )
})
