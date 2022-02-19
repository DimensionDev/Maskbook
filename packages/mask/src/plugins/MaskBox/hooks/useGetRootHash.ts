import { useAsyncRetry } from 'react-use'
import { useWallet } from '@masknet/web3-shared-evm'
import { getHashRoot } from '../apis'

export function useGetRootHash(qualification: string) {
    const wallet = useWallet()
    qualification?.replace(/0x/, '')
    const leafArray = wallet?.address
        ?.replace(/0x/, '')
        ?.match(/.{1,2}/g)
        ?.map((byte) => Number.parseInt(byte, 16))
    const leaf = encodeURIComponent(Buffer.from(new Uint8Array(leafArray as number[])).toString('base64'))
    return useAsyncRetry(async () => {
        return getHashRoot(leaf, qualification)
    }, [qualification])
}
