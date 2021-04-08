import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useERC721TokenIdsOfOwner } from '../../../web3/hooks/useERC721TokensOfOwner'
import { useERC721TokenIdsOfSpender } from '../../../web3/hooks/useERC721TokensOfSpender'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useTokenDetailed } from '../../../web3/hooks/useTokenDetailed'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { MARKETPLACE_CONSTANTS } from '../constants'
import type { MarketplaceJSONPayloadInMask } from '../types'

function useMarketplaceSellerState() {
    const account = useAccount()
    const [address, setAddress] = useState('')
    const spender = useConstant(MARKETPLACE_CONSTANTS, 'HAPPY_NFT_ITO_ADDRESS')

    const tokenDetailedAsync = useERC721TokenDetailed(address)
    const tokenIdsOfOwnerAsync = useERC721TokenIdsOfOwner(address, account)
    const tokenIdsOfSpenderAsync = useERC721TokenIdsOfSpender(address, spender, tokenIdsOfOwnerAsync.value)

    return {
        /**
         * NFT contract address
         */
        address,
        setAddress,

        tokenDetailedAsync,
        tokenIdsOfOwnerAsync,
        tokenIdsOfSpenderAsync,
    }
}

function useMarketplaeBuyerState() {
    const [payload, setPayload] = useState<MarketplaceJSONPayloadInMask | null>(null)

    const owner = payload?.seller.address ?? ''
    const address = payload?.token.address ?? ''
    const spender = useConstant(MARKETPLACE_CONSTANTS, 'HAPPY_NFT_ITO_ADDRESS')

    const [exchangeToken, setExchangeToken] = useState<EtherTokenDetailed | ERC20TokenDetailed>()
    const exchangeTokenDetailedAsync = useTokenDetailed(
        exchangeToken?.type ?? EthereumTokenType.Ether,
        exchangeToken?.address ?? '',
    )

    const tokenDetailedAsync = useERC721TokenDetailed(address)
    const tokenIdsOfOwnerAsync = useERC721TokenIdsOfOwner(address, owner)
    const tokenIdsOfSpenderAsync = useERC721TokenIdsOfSpender(address, spender, tokenIdsOfOwnerAsync.value)

    return {
        /**
         * Marketplace JSON payload in Mask
         */
        payload,
        setPayload,

        /**
         * Exchange token
         */
        exchangeToken,
        setExchangeToken,
        exchangeTokenDetailedAsync,

        tokenDetailedAsync,
        tokenIdsOfOwnerAsync,
        tokenIdsOfSpenderAsync,
    }
}

export const MarketplaceSellerState = createContainer(useMarketplaceSellerState)
export const MarketplaceBuyerState = createContainer(useMarketplaeBuyerState)
