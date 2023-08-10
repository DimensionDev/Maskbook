import { memo } from 'react'
import { Icon, type IconProps } from '../Icon/index.js'

export interface ChainIconProps extends IconProps {}
export const ChainIcon = memo<ChainIconProps>(function ChainIcon({ ...rest }) {
    return <Icon {...rest} sx={{ fontSize: 12, fontWeight: 'bold', ...rest.sx }} size={rest.size ?? 12.5} />
})
