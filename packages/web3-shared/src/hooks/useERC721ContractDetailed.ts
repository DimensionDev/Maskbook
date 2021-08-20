import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import type { ChainId } from '../types'
import { useChainId } from './useChainId'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { createERC721ContractDetailed, safeNonPayableTransactionCall } from '../utils'
import type { ERC721 } from '../../../web3-contracts/types/ERC721'
import { useOpenseaAPIConstants } from '../constants'

export function useERC721ContractDetailed(address: string) {
    const chainId = useChainId()
    const { GET_CONTRACT_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!EthereumAddress.isValid(address) || !erc721TokenContract) return
        if (!GET_CONTRACT_URL) return getERC721ContractDetailedFromChain(address, chainId, erc721TokenContract)
        const contractDetailedFromOpensea = await getERC721ContractDetailedFromOpensea(
            address,
            chainId,
            GET_CONTRACT_URL,
        )

        return contractDetailedFromOpensea ?? getERC721ContractDetailedFromChain(address, chainId, erc721TokenContract)
    }, [chainId, erc721TokenContract, address])
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
    const response = await fetch(`${apiUrl}/${address}`)
    type openseaContractData = {
        name: string
        symbol: string
        image_url: string
    }
    if (response.ok) {
        const data: openseaContractData = await response.json()
        return createERC721ContractDetailed(chainId, address, data.name, data.symbol, undefined, data.image_url)
    }
    return null
}
