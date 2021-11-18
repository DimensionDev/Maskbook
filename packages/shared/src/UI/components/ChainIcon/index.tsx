import { memo } from 'react'
import { ChainId, getChainDetailed, resolveChainColor } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '../ImageIcon'

const useStyles = makeStyles()((theme) => ({
    point: {
        width: 12.5,
        height: 12.5,
        borderRadius: 6.25,
        margin: 3.75,
    },
    border: {
        border: `1px solid ${theme.palette.background.paper}`,
    },
}))
export interface ChainIconProps {
    chainId: ChainId
    size?: number
    bordered?: boolean
}

export const ChainIcon = memo<ChainIconProps>(({ chainId, size, bordered }) => {
    const { classes } = useStyles()
    const chainDetail = getChainDetailed(chainId)

    return chainDetail?.network === 'mainnet' ? (
        <ImageIcon size={size ?? 20} />
    ) : (
        <div
            style={{
                backgroundColor: resolveChainColor(chainId),
            }}
            className={bordered ? `${classes.point} ${classes.border}` : classes.point}
        />
    )
})
