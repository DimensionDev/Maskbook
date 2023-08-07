import type { AvatarProps } from '@mui/material'
import { memo } from 'react'
import { Icon } from '../Icon/index.js'

export interface ChainIconProps {
    color?: string
    size?: number
    name?: string
}

const avatarProps: AvatarProps = {
    sx: { fontSize: 12, fontWeight: 'bold' },
}
export const ChainIcon = memo<ChainIconProps>(function ChainIcon({ color, size = 12.5, name }) {
    return <Icon color={color} size={size} name={name} AvatarProps={avatarProps} />
})
