import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { HistoryTable } from '../HistoryTable'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

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
