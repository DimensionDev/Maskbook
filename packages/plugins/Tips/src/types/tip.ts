import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount } from '@masknet/shared-base'

export interface TipTask {
    recipient?: string
    recipientUserId?: string
    accounts: Array<SocialAccount<Web3Helper.ChainIdAll>>
}
