import { Icons } from '@masknet/icons'
import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { Button, styled } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { NetworkIcon } from '../NetworkIcon/index.js'

const AllButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    padding: 0,
    borderRadius: '50%',
    fontSize: 10,
    backgroundColor: theme.palette.maskColor.highlight,
    '&:hover': {
        backgroundColor: theme.palette.maskColor.highlight,
        boxShadow: 'none',
    },
}))

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
    hideAllButton?: boolean
    chainId?: Web3Helper.ChainIdAll
    onChainChange?: (chainId: Web3Helper.ChainIdAll | undefined) => void
}

export const SelectNetworkSidebar = memo(function SelectNetworkSidebar({
    networks,
    chainId,
    pluginID,
    onChainChange,
    hideAllButton,
    className,
    ...rest
}: SelectNetworkSidebarProps) {
    const { classes, cx } = useStyles()

    // Do not translate the "All" button
    return (
        <div className={cx(classes.sidebar, className)} {...rest}>
            {networks.length > 1 && !hideAllButton ?
                <AllButton className={classes.networkButton} onClick={() => onChainChange?.(undefined)}>
                    All
                    {!chainId ?
                        <Icons.BorderedSuccess className={classes.indicator} size={12} />
                    :   null}
                </AllButton>
            :   null}
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
