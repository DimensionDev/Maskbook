import { bridgedSolanaProvider } from '@masknet/injected-script'
import { getStorage } from '../storage'
import { hexToBase58 } from '../utils'

type BNLike = {
    _bn: string
}

export async function storeConnection(pubKey: string | BNLike, chainId?: number) {
    const base58Key = typeof pubKey === 'string' ? pubKey : hexToBase58(pubKey._bn)
    const storage = getStorage()
    await storage.publicKey.setValue(base58Key)
    if (chainId) {
        await storage.network.setValue(chainId)
    }
}
export async function connectWallet(init = false) {
    const rsp = await bridgedSolanaProvider.connect({ onlyIfTrusted: init })
    if (rsp?.publicKey) {
        await storeConnection(rsp.publicKey)
    }
    return rsp?.publicKey
}

export async function watchAccount() {
    bridgedSolanaProvider.on('accountChanged', async (publicKey) => {
        if (publicKey) {
            await storeConnection(publicKey as string)
        } else {
            await connectWallet()
        }
    })
}
