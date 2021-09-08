import { useAsync } from 'react-use'
import { WalletRPC } from '../messages'
import { first } from 'lodash-es'
import { useWallet } from '@masknet/web3-shared'

/** Return the wallet with mnemonic words */
export function useWalletHD() {
    const selectedWallet = useWallet()?.address
    return useAsync(async () => {
        const selected = await WalletRPC.getWallet(selectedWallet)
        if (selected?.mnemonic.length) return selected
        const all = await WalletRPC.getWallets()
        return first(all.filter((x) => x.mnemonic.length).sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime()))
    }, [selectedWallet]).value
}
