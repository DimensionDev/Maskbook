import type { Web3Helper } from '@masknet/web3-helpers'
import { type ChainId } from '@masknet/web3-shared-evm'
import type { TraderAPI } from '../types/Trader.js'

export class DODO implements TraderAPI.Provider {
    public async getTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount_: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        // TODO: implemented with dodo's new api
        return null
    }
}
