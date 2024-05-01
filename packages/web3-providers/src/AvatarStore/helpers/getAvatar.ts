import { EnhanceableSite, NetworkPluginID, createLookupTableResolver } from '@masknet/shared-base'
import { getAddress } from './getAddress.js'
import { Web3Storage } from '../../Storage/apis/Storage.js'
import { RSS3_KEY_SITE, type AvatarNextID } from '../types.js'
import { getAvatarFromStorage } from './storage.js'
import { getAvatarFromRSS3 } from './getAvatarFromRSS3.js'

const NFT_AVATAR_METADATA_STORAGE = 'com.maskbook.avatar.metadata.storage'

const resolveRSS3Key = createLookupTableResolver<EnhanceableSite, RSS3_KEY_SITE | undefined>(
    {
        [EnhanceableSite.Facebook]: RSS3_KEY_SITE.FACEBOOK,
        [EnhanceableSite.Twitter]: RSS3_KEY_SITE.TWITTER,
        [EnhanceableSite.Instagram]: RSS3_KEY_SITE.INSTAGRAM,
        [EnhanceableSite.Localhost]: undefined,
        [EnhanceableSite.Minds]: undefined,
        [EnhanceableSite.OpenSea]: undefined,
        [EnhanceableSite.Mirror]: undefined,
        [EnhanceableSite.Firefly]: undefined,
    },
    undefined,
)

export async function getAvatar<T extends NetworkPluginID>(
    siteType: EnhanceableSite,
    userId: string,
): Promise<AvatarNextID<T> | null> {
    const storage = await getAddress(siteType, userId)
    if (!storage?.address) return null

    if (storage.networkPluginID !== NetworkPluginID.PLUGIN_EVM) {
        const record = await Web3Storage.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${siteType}`).get<
            AvatarNextID<T>
        >(userId)
        return record ?? null
    }

    const avatar = await getAvatarFromStorage(userId, storage.address)
    if (avatar) return avatar as AvatarNextID<T>

    const rss3Key = resolveRSS3Key(siteType)
    if (!rss3Key) return null

    const avatarRSS3 = await getAvatarFromRSS3(rss3Key, userId, storage.address)
    if (avatarRSS3) return avatarRSS3 as AvatarNextID<T>

    return null
}
