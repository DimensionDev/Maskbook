import { memo } from 'react'
import { ChainId, getChainDetailed, resolveChainColor } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '../ImageIcon'

const useStyles = makeStyles()({
    point: {
        width: 12.5,
        height: 12.5,
        borderRadius: 6.25,
        margin: 3.75,
    },
})
export interface ChainIconProps {
    chainId: ChainId
    size?: number
}

export const ChainIcon = memo<ChainIconProps>(({ chainId, size }) => {
    const { classes } = useStyles()
    const chainDetail = getChainDetailed(chainId)

    return chainDetail?.network === 'mainnet' ? (
        <ImageIcon size={size ?? 20} icon="" />
    ) : (
        <div style={{ backgroundColor: resolveChainColor(chainId) }} className={classes.point} />
    )
})
