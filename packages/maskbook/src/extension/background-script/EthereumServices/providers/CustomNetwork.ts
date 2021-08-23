import { first } from 'lodash-es'
import type { ChainId } from '@masknet/web3-shared'
import * as Maskbook from './Maskbook'
import { getCustomNetwork } from '../../../../plugins/Wallet/services'
import { currentChainIdSettings } from '../../../../plugins/Wallet/settings'

export async function createWeb3({ chainId = currentChainIdSettings.value }: { chainId?: number }) {
    const network = await getCustomNetwork(chainId)
    if (!network) throw new Error('Unknown network type.')
    const url = first(network.rpcUrls)
    if (!url) throw new Error('Failed to found url.')
    return Maskbook.createWeb3({
        url,
        chainId: network.chainId as unknown as ChainId,
    })
}

export async function requestAccounts(chainId_?: number) {
    const web3 = await createWeb3({ chainId: chainId_ })
    const chainId = await web3.eth.getChainId()
    const accounts = await web3.eth.requestAccounts()
    if (chainId !== chainId_) throw new Error('The chain id is not matched with the expected one.')
    return {
        chainId,
        accounts,
    }
}
