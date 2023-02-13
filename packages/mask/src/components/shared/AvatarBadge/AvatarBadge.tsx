import type { SocialIdentity } from '@masknet/web3-shared-base'
import type { IconButtonProps } from '@mui/material'
import type { FC } from 'react'
import { useCollectionByTwitterHandler } from '../../../plugins/Trader/trending/useTrending.js'
import { NFTProjectAvatarBadge } from './NFTProjectAvatarBadge.js'
import { ProfileAvatarBadge } from './ProfileAvatarBadge.js'

interface Props extends IconButtonProps {
    userId: string
    identity?: SocialIdentity
}
export const AvatarBadge: FC<Props> = ({ userId, identity }) => {
    const { value: collectionList } = useCollectionByTwitterHandler(userId)
    if (collectionList?.[0]) {
        return <NFTProjectAvatarBadge userId={userId} address={collectionList?.[0].address ?? ''} identity={identity} />
    }

    return <ProfileAvatarBadge userId={userId} />
}
