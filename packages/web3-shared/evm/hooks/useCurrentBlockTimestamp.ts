import { useAsyncRetry } from 'react-use'
import { useMulticallContract } from '../contracts/useMulticallContract'
import type { ChainId } from '../types'
import { useChainId } from './useChainId'
import { numberToHex } from 'web3-utils'

export function useCurrentBlockTimestamp(targetChainId?: ChainId) {
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const multicallContract = useMulticallContract(chainId)
    return useAsyncRetry(
        async () =>
            multicallContract?.methods.getCurrentBlockTimestamp().call({
                chainId: numberToHex(chainId),
            }),
        [multicallContract, chainId],
    )
}
