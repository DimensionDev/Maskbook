import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Token } from '../types/index.js'
import { toTokenIdentifier } from '../utils.js'

import { getEvents } from '../apis/index.js'

export function useEvents(token?: Token) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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
                    avatarPath: event.avatarPath,
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
