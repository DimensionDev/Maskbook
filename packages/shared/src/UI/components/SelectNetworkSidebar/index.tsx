import { Icons } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
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

const useStyles = makeStyles()({
    sidebar: {
        flexShrink: 0,
        boxSizing: 'border-box',
        height: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    networkButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
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
})

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
    const t = useSharedI18N()

    const { classes, cx } = useStyles()

    return (
        <div className={cx(classes.sidebar, className)} {...rest}>
            {networks.length > 1 && !hideAllButton ? (
                <AllButton className={classes.networkButton} onClick={() => onChainChange?.(undefined)}>
                    {t.all()}
                    {!chainId ? <Icons.BorderedSuccess className={classes.indicator} size={12} /> : null}
                </AllButton>
            ) : null}
            {networks.map((x) => (
                <Button
                    variant="text"
                    key={x.chainId}
                    className={classes.networkButton}
                    disableRipple
                    onClick={() => onChainChange?.(x.chainId)}>
                    <NetworkIcon pluginID={pluginID} chainId={x.chainId} name={x.name} size={24} />
                    {chainId === x.chainId ? <Icons.BorderedSuccess className={classes.indicator} size={12} /> : null}
                </Button>
            ))}
        </div>
    )
})
