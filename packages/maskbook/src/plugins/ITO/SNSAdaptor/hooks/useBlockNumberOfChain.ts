import { ChainId, getRPCConstants, EthereumMethodType } from '@masknet/web3-shared'
import { first } from 'lodash-es'
import Services from '../../../../extension/service'
import { useAsync } from 'react-use'

/**
 * Get the current block number of specified chain
 */
export function useBlockNumberOfChain(chainId: ChainId) {
    const { RPC } = getRPCConstants(chainId)
    const provderURL = first(RPC)
    if (!provderURL) throw new Error('Unknown chain id.')
    const { value } = useAsync(
        async () =>
            await Services.Ethereum.request<string>(
                {
                    method: EthereumMethodType.ETH_BLOCK_NUMBER,
                },
                { rpc: provderURL },
            ),
        [provderURL],
    )
    return value ? parseInt(value) : 0
}
