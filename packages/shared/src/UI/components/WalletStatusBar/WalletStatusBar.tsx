import { makeStyles, ShadowRootTooltip, useStylesExtends } from '@masknet/theme'
import { Box } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import classNames from 'classnames'
import { WalletMenuBar } from './WalletMenuBar'
import { WalletButton } from './WalletBarButton'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { WalletButtonActionProps, WalletMenuActionProps } from './types'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flex: 1,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 0px 20px rgba(0, 0, 0, 0.05)',
        padding: theme.spacing(2),
        borderRadius: theme.spacing(0, 0, 1.5, 1.5),
        alignItems: 'center',
        lineHeight: '18px',
        backdropFilter: 'blur(16px)',
    },
    button: {
        borderRadius: 8,
        position: 'relative',
        textAlign: 'center',
        margin: 0,
        backgroundColor: theme.palette.maskColor?.dark,
        lineHeight: '18px',
        fontSize: 14,
        height: 40,
    },
    tooltip: {
        borderRadius: 4,
        padding: 10,
        fontSize: 14,
    },
}))

export interface WalletStatusBarProps extends withClasses<'button' | 'disabled'> {
    iconSize?: number
    badgeSize?: number
    className?: string
    buttonActionProps?: WalletButtonActionProps
    menuActionProps?: WalletMenuActionProps
    onChange?: (address: string, pluginId: NetworkPluginID, chainId: ChainId) => void
    tooltip?: string | React.ReactElement | React.ReactNode
}

export function WalletStatusBar(props: WalletStatusBarProps) {
    const t = useSharedI18N()
    const { iconSize = 30, badgeSize = 12, buttonActionProps, menuActionProps, className, onChange, tooltip } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Box className={classNames(classes.root, className)}>
            <Box sx={{ flex: 1 }}>
                <WalletMenuBar
                    iconSize={iconSize}
                    badgeSize={badgeSize}
                    onChange={onChange}
                    actionProps={menuActionProps}
                />
            </Box>
            <ShadowRootTooltip title={tooltip ?? ''} classes={{ tooltip: classes.tooltip }} arrow placement="top">
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <WalletButton actionProps={buttonActionProps} onConnectWallet={menuActionProps?.onConnectWallet} />
                </Box>
            </ShadowRootTooltip>
        </Box>
    )
}
