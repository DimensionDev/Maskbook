import { remove } from 'lodash-es'
import * as fcl from '@onflow/fcl'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { getAuthConstants } from '@masknet/web3-shared-flow/constants'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-flow'
import { createConstantSubscription, createSubscriptionFromAsync } from '@masknet/shared-base'
import { formatAddress } from '../../helpers'

function createClient(chainId: ChainId) {
    const authConstants = getAuthConstants(chainId)

    fcl.config({
        'accessNode.api': authConstants.ACCESS_NODE_API,
        'app.detail.title': authConstants.MASK_APP_TITLE,
        'app.detail.icon': authConstants.MASK_APP_ICON,
        'challenge.handshake': authConstants.CHALLENGE_HANDSHAKE,
    })
    return fcl
}

function createCurrentUserSubscription<T>(chainId: ChainId, fallback: T, getter: (client: typeof fcl) => Promise<T>) {
    const client = createClient(chainId)
    const listeners: (() => void)[] = []

    client.currentUser().subscribe(() => {
        listeners.forEach((f) => f())
    })

    return createSubscriptionFromAsync(
        async () => {
            return getter(fcl)
        },
        fallback,
        (sub) => {
            listeners.push(sub)
            return () => remove(listeners, sub)
        },
    )
}

function createWeb3State(): Web3Plugin.ObjectCapabilities.Capabilities {
    const chainId = ChainId.Testnet
    return {
        Shared: {
            allowTestnet: createConstantSubscription(false),
            account: createCurrentUserSubscription(chainId, '', async (client) => {
                const currentUser = await client.currentUser().snapshot()
                return currentUser.addr ?? ''
            }),
            chainId: createConstantSubscription(chainId),
            networkType: createConstantSubscription(NetworkType.Flow),
            providerType: createCurrentUserSubscription(chainId, undefined, async (client) => {
                return client.currentUser().snapshot() ? ProviderType.Blocto : undefined
            }),
        },
        Utils: {
            formatAddress,
            isChainIdValid: () => true,
        },
    }
}

export const Web3State = createWeb3State()
