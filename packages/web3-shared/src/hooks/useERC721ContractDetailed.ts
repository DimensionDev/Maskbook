import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import type { ChainId } from '../types'
import { useChainId } from './useChainId'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { createERC721ContractDetailed, safeNonPayableTransactionCall } from '../utils'
import type { ERC721 } from '../../../web3-contracts/types/ERC721'

export function useERC721ContractDetailed(address: string) {
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!EthereumAddress.isValid(address) || !erc721TokenContract) return
        return getERC721ContractDetailed(address, chainId, erc721TokenContract)
    }, [chainId, erc721TokenContract, address])
}

const lazyBlank = Promise.resolve('')

async function getERC721ContractDetailed(address: string, chainId: ChainId, erc721TokenContract: ERC721) {
    const results = await Promise.allSettled([
        safeNonPayableTransactionCall(erc721TokenContract.methods.name()) ?? lazyBlank,
        safeNonPayableTransactionCall(erc721TokenContract.methods.symbol()) ?? lazyBlank,
        safeNonPayableTransactionCall(erc721TokenContract.methods.baseURI()) ?? lazyBlank,
    ])
    const [name, symbol, baseURI] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : '',
    ) as string[]

    return createERC721ContractDetailed(chainId, address, name, symbol, baseURI)
}
