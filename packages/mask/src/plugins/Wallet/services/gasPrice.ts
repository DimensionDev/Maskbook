import type { ChainId } from '@masknet/web3-shared-evm'
import { getGasPriceDict } from '../apis/debank'

export function getGasPriceDictFromDeBank(chainId: ChainId) {
    return getGasPriceDict(chainId)
}
