import { Icons, type GeneratedIconProps } from '@masknet/icons'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { memo } from 'react'

interface Props extends GeneratedIconProps {
    platform: RSS3BaseAPI.Platform
    handle: string
}
export const UserAvatar = memo(function UserAvatar({ platform, handle, ...rest }: Props) {
    return <Icons.Avatar size={20} alt={handle} title={platform} {...rest} />
})
