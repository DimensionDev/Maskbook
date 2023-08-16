import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getMerkleProof } from '../apis/index.js'

export function useMerkleProof(root?: string) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsyncRetry(async () => {
        if (!root) return

        const leaf = Buffer.from(
            (account.replace(/0x/, '').match(/.{2}/g) ?? []).map((x) => Number.parseInt(x, 16)),
        ).toString('base64')

        return getMerkleProof(leaf, root)
    }, [account, root])
}
