import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-shared-evm'
import { getMerkleProof } from '../apis'

export function useMerkelProof(root?: string) {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!root) return

        const leaf = encodeURIComponent(
            Buffer.from(
                new Uint8Array(
                    account
                        .replace(/0x/, '')
                        .match(/.{1,2}/g)
                        ?.map((byte) => Number.parseInt(byte, 16)) ?? [],
                ),
            ).toString('base64'),
        )
        return getMerkleProof(leaf, root)
    }, [account, root])
}
