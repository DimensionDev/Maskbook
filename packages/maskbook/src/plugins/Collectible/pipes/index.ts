import { Network } from 'opensea-js'
import { ChainId } from '../../../web3/types'
import { NullAddress } from '../constants'
import { OpenSeaAssetEventAccount, OpenSeaAssetEventType } from '../apis'

export function resolveAssetEventType(eventType: OpenSeaAssetEventType, from?: OpenSeaAssetEventAccount) {
    switch (eventType) {
        case OpenSeaAssetEventType.CREATED:
            return from?.user?.publicUsername === NullAddress ? 'Created' : 'List'
        case OpenSeaAssetEventType.SUCCESSFUL:
            return 'Sale'
        case OpenSeaAssetEventType.CANCELLED:
            return 'Cancel'
        case OpenSeaAssetEventType.BID_WITHDRAWN:
            return 'Bid Cancel'
        case OpenSeaAssetEventType.BID_ENTERED:
            return 'Bid'
        case OpenSeaAssetEventType.TRANSFER:
            return from?.user?.publicUsername === NullAddress ? 'Created' : 'Transfer'
        case OpenSeaAssetEventType.OFFER_ENTERED:
            return 'Offer'
        default:
            return eventType
    }
}

export function resolveOpenSeaNetwork(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return Network.Main
        case ChainId.Rinkeby:
            return Network.Rinkeby
        default:
            throw new Error(`The chain id ${chainId} is not supported.`)
    }
}
