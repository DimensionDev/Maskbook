import { useAsync } from 'react-use'
import { ChainId, EthereumMethodType } from '@masknet/web3-shared-evm'
import Services from '../../../../extension/service'

/**
 * Get the current block number of specified chain
 */
export function useBlockNumberOfChain(chainId: ChainId) {
    const { value } = useAsync(
        () => Services.Ethereum.request<string>({ method: EthereumMethodType.ETH_BLOCK_NUMBER }, { chainId }),
        [chainId],
    )
    return value ? Number.parseInt(value, 10) : 0
}
