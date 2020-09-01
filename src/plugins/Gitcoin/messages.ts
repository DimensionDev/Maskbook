import { BatchedMessageCenter } from '../../utils/messages'
import type { WalletDetails, ERC20TokenDetails } from '../../extension/background-script/PluginService'
import type Services from '../../extension/service'

export interface FundGrantEvent {
    address: string
    loading?: boolean
    wallets: WalletDetails[]
    tokens: ERC20TokenDetails[]
    title: string
    description?: string
}

interface MaskbookGitcoinMessages {
    /**
     * Fund grant
     */
    fundGrant: FundGrantEvent
}

export const MessageCenter = new BatchedMessageCenter<MaskbookGitcoinMessages>(true, 'maskbook-gitcoin-events')
