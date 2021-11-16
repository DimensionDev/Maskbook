import { memo } from 'react'
import { ChainId, getChainDetailed, getNetworkTypeFromChainId, resolveChainColor } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { NetworkIcon } from '../NetworkIcon'

const useStyles = makeStyles()((theme) => ({
    point: {
        width: 12.5,
        height: 12.5,
        borderRadius: 6.25,
        margin: 3.75,
    },
    border: {
        border: `1px solid ${theme.palette.background.default}`,
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
        <NetworkIcon size={size ?? 20} networkType={getNetworkTypeFromChainId(chainId)} bordered={bordered ?? false} />
    ) : (
        <div
            style={{
                backgroundColor: resolveChainColor(chainId),
            }}
            className={bordered ? `${classes.point} ${classes.border}` : classes.point}
        />
    )
})
