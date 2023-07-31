import { Icons } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
import { EMPTY_OBJECT, type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Button, styled } from '@mui/material'
import { memo } from 'react'
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

interface StyleProps {
    gap?: string | number
}

const useStyles = makeStyles<StyleProps>()((theme, { gap = 1.5 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        sidebar: {
            width: 36,
            flexShrink: 0,
            paddingRight: theme.spacing(1.5),
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
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
    }
})

interface SelectNetworkSidebarProps {
    gridProps?: StyleProps
    networks: Web3Helper.NetworkDescriptorAll[]
    pluginID: NetworkPluginID
    hiddenAllButton?: boolean
    chainId?: Web3Helper.ChainIdAll
    onChainChange?: (chainId: Web3Helper.ChainIdAll | undefined) => void
}

export const SelectNetworkSidebar = memo(function SelectNetworkSidebar({
    gridProps = EMPTY_OBJECT,
    networks,
    chainId,
    pluginID,
    onChainChange,
    hiddenAllButton,
}: SelectNetworkSidebarProps) {
    const t = useSharedI18N()

    const { classes } = useStyles(gridProps)

    return (
        <div className={classes.sidebar}>
            {networks.length > 1 && !hiddenAllButton ? (
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
                    <NetworkIcon pluginID={pluginID} chainId={x.chainId} ImageIconProps={{ size: 24 }} />
                    {chainId === x.chainId ? <Icons.BorderedSuccess className={classes.indicator} size={12} /> : null}
                </Button>
            ))}
        </div>
    )
})
