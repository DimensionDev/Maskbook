import { OrderSide } from 'opensea-js/lib/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { resolveAPILinkOnCryptoartAI } from '../pipes/index.js'
import { TransactionType } from '../types/index.js'

export async function getAsset(tokenId: string, chainId?: ChainId) {
    const ownersResponse: any = await (
        await fetch(urlcat(resolveAPILinkOnCryptoartAI(chainId), '/api/artwork/current/owners/:tokenId', { tokenId }), {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json',
            },
        })
    ).json()

    const tradeResponse: any = await (
        await fetch(urlcat(resolveAPILinkOnCryptoartAI(chainId), '/api/artwork/tradeInfo/:tokenId', { tokenId }), {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json',
            },
        })
    ).json()

    const fetchResponse = await (
        await fetch(urlcat(resolveAPILinkOnCryptoartAI(chainId), '/api/artwork/detail'), {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json',
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
                          ownerAvatar: fetchResponse.data.creatorInfo.avatarPath,
                          ownerRoleType: fetchResponse.data.creatorInfo.roleType,
                      },
                  ]
                : ownersResponse.data,
        trade: tradeResponse.data,
    }
}

export async function getEvents(tokenId: string, chainId?: ChainId) {
    const historyResponse: any = await (
        await fetch(urlcat(resolveAPILinkOnCryptoartAI(chainId), '/api/artwork/recent/history/:tokenId', { tokenId }), {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json',
            },
        })
    ).json()

    return historyResponse.data
}

export async function getOrders(tokenId: string, side = OrderSide.Buy, chainId?: ChainId) {
    const tradeResponse: any = await (
        await fetch(urlcat(resolveAPILinkOnCryptoartAI(chainId), '/api/artwork/tradeInfo/:tokenId', { tokenId }), {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Accept: 'application/json',
            },
        })
    ).json()

    const filterType = [TransactionType.BID_PLACED, TransactionType.BID_WITHDRAW, TransactionType.SETTLED] as const
    const historyResponse = (await getEvents(tokenId, chainId))
        .filter((event: any) => {
            return filterType.includes(event.transactionType)
        })
        .map((event: any, idx: any) => {
            event.status = 'Expired'
            if (event.transactionType === TransactionType.BID_WITHDRAW) event.status = 'Withdrawn'
            else if (event.transactionType === TransactionType.SETTLED) event.status = 'Settled'
            return event
        })

    return {
        trade: tradeResponse.data,
        history: historyResponse.map((event: any, idx: any) => {
            if (idx === 0 && event.transactionType === TransactionType.BID_PLACED) {
                event.status = 'Active'
            }
            return event
        }),
    }
}
