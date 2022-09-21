import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer/index.js'
import { HistoryTable } from '../HistoryTable/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'

interface HistoryProps {
    selectedChainId: Web3Helper.ChainIdAll
}

export const History = memo<HistoryProps>(({ selectedChainId }) => {
    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <HistoryTable selectedChainId={selectedChainId} />
        </ContentContainer>
    )
})
