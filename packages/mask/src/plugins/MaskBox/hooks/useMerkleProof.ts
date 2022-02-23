import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-shared-evm'
import { getMerkleProof } from '../apis'

export function useMerkelProof(root?: string) {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!root) return

        const leaf = Buffer.from(
            (account.replace(/0x/, '').match(/.{2}/g) ?? []).map((x) => Number.parseInt(x, 16)),
        ).toString('base64')

        return getMerkleProof(leaf, root)
    }, [account, root])
}
