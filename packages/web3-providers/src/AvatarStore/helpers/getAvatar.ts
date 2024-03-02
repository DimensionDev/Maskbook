import {
    EnhanceableSite,
    NetworkPluginID,
    createLookupTableResolver,
    getEnhanceableSiteType,
} from '@masknet/shared-base'
import { getAddress } from './getAddress.js'
import { Web3Storage } from '../../Storage/apis/Storage.js'
import { RSS3_KEY_SITE, type AvatarNextID } from '../types.js'
import { getAvatarFromStorage } from './getAvatarFromStorage.js'
import { getAvatarFromRSS3 } from './getAvatarFromRSS3.js'

const NFT_AVATAR_METADATA_STORAGE = 'com.maskbook.avatar.metadata.storage'

const resolveRSS3Key = createLookupTableResolver<EnhanceableSite, RSS3_KEY_SITE | undefined>(
    {
        [EnhanceableSite.Facebook]: RSS3_KEY_SITE.FACEBOOK,
        [EnhanceableSite.Twitter]: RSS3_KEY_SITE.TWITTER,
        [EnhanceableSite.Instagram]: RSS3_KEY_SITE.INSTAGRAM,
        [EnhanceableSite.Localhost]: undefined,
        [EnhanceableSite.App]: undefined,
        [EnhanceableSite.Minds]: undefined,
        [EnhanceableSite.OpenSea]: undefined,
        [EnhanceableSite.Mirror]: undefined,
        [EnhanceableSite.Firefly]: undefined,
    },
    undefined,
)

export async function getAvatar<T extends NetworkPluginID>(userId: string) {
    const siteType = getEnhanceableSiteType()
    if (!siteType) return

    const storage = await getAddress(siteType, userId)
    if (!storage?.address) return

    if (storage.networkPluginID !== NetworkPluginID.PLUGIN_EVM)
        return Web3Storage.createKVStorage(`${NFT_AVATAR_METADATA_STORAGE}_${siteType}`).get<AvatarNextID<T>>(userId)

    const avatar = await getAvatarFromStorage(userId, storage.address)
    if (avatar) return avatar

    const rss3Key = resolveRSS3Key(siteType)
    if (!rss3Key) return

    return getAvatarFromRSS3(rss3Key, userId, storage.address)
}
