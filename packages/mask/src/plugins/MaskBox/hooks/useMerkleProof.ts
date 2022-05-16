import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { getMerkleProof } from '../apis'

export function useMerkelProof(root?: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!root) return

        const leaf = Buffer.from(
            (account.replace(/0x/, '').match(/.{2}/g) ?? []).map((x) => Number.parseInt(x, 16)),
        ).toString('base64')

        return getMerkleProof(leaf, root)
    }, [account, root])
}
