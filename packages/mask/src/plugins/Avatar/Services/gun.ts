import { ChainId, isSameAddress } from '@masknet/web3-shared-evm'
import { NFT_AVATAR_GUN_SERVER } from '../constants'
import { KeyValueAPI } from '@masknet/web3-providers'

const NFTAvatarDB = new KeyValueAPI().createJSON_Storage(NFT_AVATAR_GUN_SERVER)

// After reinstalling the system, it cannot be retrieved for the first time, so it needs to be taken twice
export async function getUserAddress(userId: string, chainId?: ChainId) {
    const result = await NFTAvatarDB.get<Record<ChainId, string>>(userId)
    return result?.[chainId ?? ChainId.Mainnet]
}

export async function setUserAddress(userId: string, address: string, chainId?: ChainId) {
    try {
        await NFTAvatarDB.set<Record<number, string>>(userId, { [chainId ?? ChainId.Mainnet]: address })
    } catch {
        // do nothing
    } finally {
        const _address = await getUserAddress(userId, chainId)
        if (!isSameAddress(_address, address))
            throw new Error('Something went wrong, and please check your connection.')
    }
}
