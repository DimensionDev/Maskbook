import { ChainId } from '@masknet/web3-shared-evm'
import { OpenSeaAPI_Key, OpenSeaBaseURL, OpenSeaRinkebyBaseURL } from '../../Collectible/constants'
import type { CollectionNFT } from '../types'
import urlcat from 'urlcat'

async function createOpenSeaAPI(chainId: ChainId) {
    if (chainId === ChainId.Rinkeby) return OpenSeaRinkebyBaseURL
    return OpenSeaBaseURL
}

export async function getAssetContract(contract_address: string, chainId: ChainId) {
    const fetchResponse = await (
        await fetch(urlcat(await createOpenSeaAPI(chainId), `/asset_contract/${contract_address}`), {
            mode: 'cors',
            headers: { 'x-api-key': OpenSeaAPI_Key },
        })
    ).json()
    const collection = fetchResponse as CollectionNFT
    return collection
}
