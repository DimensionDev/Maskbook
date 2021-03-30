import { OpenSeaPort } from 'opensea-js'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'

function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: console.log,
        send: console.log, // {version:sdfsdfdf}
        request: console.log,
    }
}

async function createOpenSeaPort() {
    const chainId = await getChainId()
    return new OpenSeaPort(createExternalProvider(), {
        networkName: resolveOpenSeaNetwork(chainId),
    })
}

export async function getAsset(tokenAddress: string, tokenId: string) {
    return (await createOpenSeaPort()).api.getAsset({ tokenAddress, tokenId })
}

export async function getOrders() {
    return (await createOpenSeaPort()).api.getOrders()
}

export async function getOffers() {
    return (await createOpenSeaPort()).api.getOrders()
}
