import { OpenSeaPort } from 'opensea-js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { request, requestSend } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaAPI_Key, ReferrerAddress } from '../constants'
import { currentChainIdSettings } from '../../Wallet/settings'

function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: requestSend,
        send: requestSend,
        request,
    }
}

async function createOpenSeaPortChain(chainId: ChainId.Mainnet | ChainId.Rinkeby) {
    return new OpenSeaPort(
        createExternalProvider(),
        {
            networkName: resolveOpenSeaNetwork(chainId),
            apiKey: OpenSeaAPI_Key,
        },
        console.log,
    )
}

async function createOpenSeaPort(chainId?: ChainId) {
    return createOpenSeaPortChain(chainId ?? currentChainIdSettings.value)
}

export async function getAssetFromSDK(tokenAddress: string, tokenId: string, chainId?: ChainId) {
    const _chainId = chainId ?? currentChainIdSettings.value
    const sdkResponse = await (await createOpenSeaPort(_chainId)).api.getAsset({ tokenAddress, tokenId })
    return sdkResponse
}

export async function createBuyOrder(payload: Parameters<OpenSeaPort['createBuyOrder']>[0]) {
    return (await createOpenSeaPort()).createBuyOrder({
        referrerAddress: ReferrerAddress,
        ...payload,
    })
}

export async function createSellOrder(payload: Parameters<OpenSeaPort['createSellOrder']>[0]) {
    return (await createOpenSeaPort()).createSellOrder(payload)
}

export async function fulfillOrder(payload: Parameters<OpenSeaPort['fulfillOrder']>[0]) {
    return (await createOpenSeaPort()).fulfillOrder({
        referrerAddress: ReferrerAddress,
        ...payload,
    })
}
