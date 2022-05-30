import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Token } from '../types'
import { toTokenIdentifier } from '../utils'

import { getEvents } from '../apis'

export function useEvents(token?: Token) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
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
