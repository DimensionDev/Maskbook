import type { IconButtonProps } from '@mui/material'
import type { FC } from 'react'
import { useCollectionByTwitterHandler } from '../../../plugins/Trader/trending/useTrending.js'
import { NFTProjectAvatarBadge } from './NFTProjectAvatarBadge.js'
import { ProfileAvatarBadge } from './ProfileAvatarBadge.js'

interface Props extends IconButtonProps {
    userId: string
}
export const AvatarBadge: FC<Props> = ({ userId }) => {
    const { value: collectionList } = useCollectionByTwitterHandler(userId)
    if (collectionList?.[0]) {
        return <NFTProjectAvatarBadge userId={userId} address={collectionList?.[0].address} />
    }

    return <ProfileAvatarBadge userId={userId} />
}
