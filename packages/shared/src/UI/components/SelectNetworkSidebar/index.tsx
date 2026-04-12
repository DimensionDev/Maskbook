import { Icons } from '@masknet/icons'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { Button } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { NetworkIcon } from '../NetworkIcon/index.js'

const useStyles = makeStyles()((theme) => ({
    sidebar: {
        flexShrink: 0,
        boxSizing: 'border-box',
        overflow: 'auto',
        scrollbarWidth: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    networkButton: {
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        minWidth: 24,
        height: 24,
        maxWidth: 24,
        padding: 0,
    },
    indicator: {
        position: 'absolute',
        right: -3,
        bottom: -1,
    },
}))

interface SelectNetworkSidebarProps extends HTMLProps<HTMLDivElement> {
    networks: Array<ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>>
    pluginID: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    onChainChange?: (chainId: Web3Helper.ChainIdAll | undefined) => void
}

export const SelectNetworkSidebar = memo(function SelectNetworkSidebar({
    networks,
    chainId,
    pluginID,
    onChainChange,
    className,
    ...rest
}: SelectNetworkSidebarProps) {
    const { classes, cx } = useStyles()

    return (
        <div className={cx(classes.sidebar, className)} {...rest}>
            {networks.map((x) => (
                <Button
                    variant="text"
                    key={x.chainId}
                    className={classes.networkButton}
                    disableRipple
                    onClick={() => onChainChange?.(x.chainId)}>
                    <NetworkIcon pluginID={pluginID} chainId={x.chainId} size={24} network={x} />
                    {chainId === x.chainId ?
                        <Icons.BorderedSuccess className={classes.indicator} size={12} />
                    :   null}
                </Button>
            ))}
        </div>
    )
})
