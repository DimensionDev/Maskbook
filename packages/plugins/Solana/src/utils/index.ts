import { ChainId, getTokenConstants } from '@masknet/web3-shared-solana'
import { SOL_ADDRESS } from '../constants'

export function isNativeTokenAddress(address: string) {
    return address === SOL_ADDRESS
}

export function getNativeTokenAddress(chainId: ChainId) {
    return getTokenConstants(chainId).SOL_ADDRESS ?? SOL_ADDRESS
}
