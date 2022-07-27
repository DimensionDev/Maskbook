import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstant } from '@masknet/web3-shared-solana'
import { SOL_ADDRESS } from '../constants'

export function isNativeTokenAddress(address: string) {
    return isSameAddress(address, SOL_ADDRESS)
}

export function getNativeTokenAddress(chainId = ChainId.Mainnet) {
    return getTokenConstant(chainId, 'SOL_ADDRESS', SOL_ADDRESS)!
}
