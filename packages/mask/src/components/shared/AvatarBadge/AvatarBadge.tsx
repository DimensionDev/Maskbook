import type { FC } from 'react'
import type { IconButtonProps } from '@mui/material'
import { NetworkPluginID, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { useCollectionByTwitterHandler } from '../../../plugins/Trader/trending/useTrending.js'
import { CollectionProjectAvatarBadge } from './CollectionProjectAvatarBadge.js'
import { ProfileAvatarBadge } from './ProfileAvatarBadge.js'
import type { Web3Helper } from '@masknet/web3-helpers'

interface Props extends IconButtonProps {
    userId: string
    identity?: SocialIdentity
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
}
export const AvatarBadge: FC<Props> = ({ userId, identity, socialAccounts }) => {
    const { value: collectionList } = useCollectionByTwitterHandler(userId)
    if (collectionList?.[0]) {
        return (
            <CollectionProjectAvatarBadge
                userId={userId}
                address={collectionList?.[0].address ?? ''}
                identity={identity}
            />
        )
    }

    return socialAccounts?.filter((x) => x.pluginID === NetworkPluginID.PLUGIN_EVM).length ? (
        <ProfileAvatarBadge userId={userId} />
    ) : null
}
