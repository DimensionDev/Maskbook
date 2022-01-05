import { OpenSeaPort } from 'opensea-js'
import { ChainId } from '@masknet/web3-shared-evm'
import { request, requestSend } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaAPI_Key, ReferrerAddress } from '../constants'

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

function createOpenSeaPortChain(chainId: ChainId.Mainnet | ChainId.Rinkeby) {
    const config = {
        networkName: resolveOpenSeaNetwork(chainId),
        apiKey: OpenSeaAPI_Key,
    }
    return new OpenSeaPort(createExternalProvider(), config, console.log)
}

function createOpenSeaPort(chainId?: ChainId) {
    return createOpenSeaPortChain(chainId === ChainId.Rinkeby ? ChainId.Rinkeby : ChainId.Mainnet)
}

export async function getAssetFromSDK(tokenAddress: string, tokenId: string) {
    return createOpenSeaPort().api.getAsset({ tokenAddress, tokenId })
}

export async function createBuyOrder(payload: Parameters<OpenSeaPort['createBuyOrder']>[0]) {
    return createOpenSeaPort().createBuyOrder({
        referrerAddress: ReferrerAddress,
        ...payload,
    })
}

export async function createSellOrder(payload: Parameters<OpenSeaPort['createSellOrder']>[0]) {
    return createOpenSeaPort().createSellOrder(payload)
}

export async function fulfillOrder(payload: Parameters<OpenSeaPort['fulfillOrder']>[0]) {
    return createOpenSeaPort().fulfillOrder({
        referrerAddress: ReferrerAddress,
        ...payload,
    })
}
