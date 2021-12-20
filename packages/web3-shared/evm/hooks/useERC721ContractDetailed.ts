import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { ChainId } from '../types'
import { useChainId } from './useChainId'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { createERC721ContractDetailed, safeNonPayableTransactionCall } from '../utils'
import { useOpenseaAPIConstants } from '../constants'
import urlcat from 'urlcat'

export function useERC721ContractDetailed(address?: string) {
    const chainId = useChainId()
    const { GET_CONTRACT_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!address || !EthereumAddress.isValid(address) || !erc721TokenContract) return

        const erc721ContractDetailedFromChain = await getERC721ContractDetailedFromChain(
            address,
            chainId,
            erc721TokenContract,
        )

        if (!GET_CONTRACT_URL) return erc721ContractDetailedFromChain

        const contractDetailedFromOpensea = await getERC721ContractDetailedFromOpensea(
            address,
            chainId,
            GET_CONTRACT_URL,
        )

        // We prefer to use `name` and `symbol` from chain rather than opensea since,
        //  these two data on opensea is sometimes incorrect. Meanwhile there's often
        //   a lack of `iconURL` from chain, which exists on opensea.
        return contractDetailedFromOpensea
            ? {
                  ...contractDetailedFromOpensea,
                  name: erc721ContractDetailedFromChain.name,
                  symbol: erc721ContractDetailedFromChain.symbol,
              }
            : erc721ContractDetailedFromChain
    }, [address, chainId, erc721TokenContract])
}

const lazyBlank = Promise.resolve('')

async function getERC721ContractDetailedFromChain(address: string, chainId: ChainId, erc721TokenContract: ERC721) {
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

async function getERC721ContractDetailedFromOpensea(address: string, chainId: ChainId, apiUrl: string) {
    const response = await fetch(urlcat(apiUrl, '/:address', { address }))
    type DataType = {
        name: string
        symbol: string
        image_url: string
    }
    if (response.ok) {
        const data: DataType = await response.json()
        return createERC721ContractDetailed(chainId, address, data.name, data.symbol, undefined, data.image_url)
    }
    return null
}
