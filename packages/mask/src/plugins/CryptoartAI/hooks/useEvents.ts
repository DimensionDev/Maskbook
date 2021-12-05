import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import type { CryptoartAIToken } from '../types'
import { toTokenIdentifier } from '../utils'

import { getEvents } from '../apis'

export function useEvents(token?: CryptoartAIToken) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!token) {
            return {
                data: [],
            }
        }

        const assetEvents = await getEvents(token.tokenId, chainId)

        return {
            data: assetEvents.map((event: any) => {
                return {
                    avatorPath: event.avatorPath,
                    award: event.award,
                    createTime: event.createTime,
                    operatorAddress: event.operatorAddress,
                    operatorName: event.operatorName,
                    operatorNikeName: event.operatorNikeName,
                    priceInEth: event.priceInEth,
                    priceInUsd: event.priceInUsd,
                    transactionType: event.transactionType,
                    transactionTypeName: event.transactionTypeName,
                    transactionUrl: event.transactionUrl,
                }
            }),
        }
    }, [chainId, toTokenIdentifier(token)])
}
