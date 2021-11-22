import { OrderSide } from 'opensea-js/lib/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { resolveAPILinkOnCryptoartAI } from '../pipes'

export async function getAsset(tokenId: string, chainId?: ChainId) {
    const ownersResponse: any = await (
        await fetch(resolveAPILinkOnCryptoartAI(chainId) + '/api/artwork/current/owners/' + tokenId, {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json, text/plain, */*',
            },
        })
    ).json()

    const tradeResponse: any = await (
        await fetch(resolveAPILinkOnCryptoartAI(chainId) + '/api/artwork/tradeInfo/' + tokenId, {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json, text/plain, */*',
            },
        })
    ).json()

    const fetchResponse = await (
        await fetch(resolveAPILinkOnCryptoartAI(chainId) + '/api/artwork/detail', {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json, text/plain, */*',
            },
            body: JSON.stringify({
                artworkId: tokenId,
                ethAddress: '',
            }),
        })
    ).json()

    return {
        ...fetchResponse.data,
        owners:
            ownersResponse.data && ownersResponse.data.length === 0 && fetchResponse.data.creatorInfo
                ? [
                      {
                          ownerAddress: fetchResponse.data.creatorInfo.ethAddress,
                          ownerName: fetchResponse.data.creatorInfo.username,
                          ownerAvator: fetchResponse.data.creatorInfo.avatorPath,
                          ownerRoleType: fetchResponse.data.creatorInfo.roleType,
                      },
                  ]
                : ownersResponse.data,
        trade: tradeResponse.data,
    }
}

export async function getEvents(tokenId: string, chainId?: ChainId) {
    const historyResponse: any = await (
        await fetch(resolveAPILinkOnCryptoartAI(chainId) + '/api/artwork/recent/history/' + tokenId, {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json, text/plain, */*',
            },
        })
    ).json()

    return historyResponse.data
}

export async function getOrders(tokenId: string, side = OrderSide.Buy, chainId?: ChainId) {
    const tradeResponse: any = await (
        await fetch(resolveAPILinkOnCryptoartAI(chainId) + '/api/artwork/tradeInfo/' + tokenId, {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json, text/plain, */*',
            },
        })
    ).json()

    const historyResponse = (await getEvents(tokenId, chainId))
        .filter((event: any) => {
            return (
                event.transactionType === 'Bid Placed' ||
                event.transactionType === 'Bid Withdrawn' ||
                event.transactionType === 'Settled'
            )
        })
        .map((event: any, idx: any) => {
            event.status =
                event.transactionType === 'Bid Withdrawn'
                    ? 'Withdrawn'
                    : event.transactionType === 'Settled'
                    ? 'Settled'
                    : 'Expired'
            return event
        })

    return {
        trade: tradeResponse.data,
        history: historyResponse.map((event: any, idx: any) => {
            if (idx === 0 && event.transactionType === 'Bid Placed') {
                event.status = 'Active'
            }
            return event
        }),
    }
}

export async function buyNow(tokenId: string, priceInEth: string, account: string, chainId?: ChainId) {
    return {}
}

export async function makeOffer(tokenId: string, priceInEth: string, account: string, chainId?: ChainId) {
    return {}
}
