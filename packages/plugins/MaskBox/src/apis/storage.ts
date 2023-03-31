import type { BoxMetadata } from '../type.js'
import type { Web3StorageServiceState } from '@masknet/web3-shared-base'

export async function getMaskBoxMetadata(boxId: string, creator: string, Storage: Web3StorageServiceState) {
    const stringStorage = Storage.createStringStorage('MaskBox', creator)
    return stringStorage.get<BoxMetadata>(boxId)
}
