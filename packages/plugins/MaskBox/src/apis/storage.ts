import { Web3Storage } from '@masknet/web3-providers'
import type { BoxMetadata } from '../type.js'

export async function getMaskBoxMetadata(boxId: string, creator: string) {
    const stringStorage = Web3Storage.createFireflyStorage('MaskBox', creator)
    return stringStorage.get<BoxMetadata>(boxId)
}
