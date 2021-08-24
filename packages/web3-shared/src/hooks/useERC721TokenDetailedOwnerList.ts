import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useOpenseaAPIConstants } from '../constants'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { safeNonPayableTransactionCall } from '../utils'
import type { ERC721ContractDetailed, ERC721TokenDetailed } from '../types'
import { getERC721TokenDetailedFromChain } from './useERC721TokenDetailed'

export const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'

export function useERC721TokenDetailedOwnerList(contractDetailed: ERC721ContractDetailed | undefined, owner: string) {
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    return useAsyncRetry(async () => {
        if (
            !erc721TokenContract ||
            !contractDetailed?.address ||
            !EthereumAddress.isValid(contractDetailed?.address) ||
            !owner
        )
            return

        if (!GET_ASSETS_URL)
            return getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner)

        const tokenDetailedOwnerListFromOpensea = await getERC721TokenDetailedOwnerListFromOpensea(
            contractDetailed,
            owner,
            GET_ASSETS_URL,
        )

        return (
            tokenDetailedOwnerListFromOpensea ??
            getERC721TokenDetailedOwnerListFromChain(erc721TokenContract, contractDetailed, owner)
        )
    }, [GET_ASSETS_URL, contractDetailed, owner])
}

async function getERC721TokenDetailedOwnerListFromChain(
    erc721TokenContract: ERC721,
    contractDetailed: ERC721ContractDetailed,
    owner: string,
) {
    const isEnumerable = await safeNonPayableTransactionCall(
        erc721TokenContract.methods.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID),
    )

    const balance = await safeNonPayableTransactionCall(erc721TokenContract.methods.balanceOf(owner))

    if (!isEnumerable || !balance) return []

    const allRequest = Array.from({ length: Number(balance) }).map(async (_v, i) => {
        const tokenId = await safeNonPayableTransactionCall(erc721TokenContract.methods.tokenOfOwnerByIndex(owner, i))

        if (tokenId) {
            const tokenDetailed = await getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)
            return tokenDetailed
        }

        return
    })

    const tokenDetailedOwnerList = (await Promise.allSettled(allRequest))
        .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
        .filter((value) => value) as ERC721TokenDetailed[]

    return tokenDetailedOwnerList
}

async function getERC721TokenDetailedOwnerListFromOpensea(
    contractDetailed: ERC721ContractDetailed,
    owner: string,
    apiURL: string,
) {
    const response = await fetch(`${apiURL}?owner=${owner}&asset_contract_address=${contractDetailed.address}`)
    type DataType = {
        image_url: string
        name: string
        token_id: string
    }
    if (response.ok) {
        const { assets }: { assets: DataType[] } = await response.json()

        return assets.map(
            (asset) =>
                ({
                    tokenId: asset.token_id,
                    contractDetailed,
                    info: {
                        name: asset.name,
                        image: asset.image_url,
                        owner,
                    },
                } as ERC721TokenDetailed),
        )
    }
    return []
}
