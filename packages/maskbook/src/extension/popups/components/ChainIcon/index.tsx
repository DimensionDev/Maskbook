import { memo } from 'react'
import { ChainId, getChainDetailed, getNetworkTypeFromChainId, resolveChainColor } from '@masknet/web3-shared'
import { makeStyles } from '@masknet/theme'
import { NetworkIcon } from '../../../../components/shared/NetworkIcon'

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
}

export const ChainIcon = memo<ChainIconProps>(({ chainId }) => {
    const { classes } = useStyles()
    const chainDetail = getChainDetailed(chainId)

    return chainDetail?.network === 'mainnet' ? (
        <NetworkIcon size={20} networkType={getNetworkTypeFromChainId(chainId)} />
    ) : (
        <div style={{ backgroundColor: resolveChainColor(chainId) }} className={classes.point} />
    )
})
