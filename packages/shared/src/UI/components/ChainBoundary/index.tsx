import React, { memo } from 'react'
import { Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip, ActionButton, useCustomSnackbar } from '@masknet/theme'
import {
    useNetworkContext,
    useChainContext,
    useNetworkDescriptor,
    useAllowTestnet,
    useChainIdValid,
    RevokeChainContextProvider,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { WalletIcon } from '../WalletIcon/index.js'
import { type ActionButtonPromiseProps } from '../ActionButton/index.js'
import { useSharedTrans } from '../../../locales/index.js'
import { SelectProviderModal } from '../../modals/modals.js'

const useStyles = makeStyles()((theme) => ({
    tooltip: {
        background: theme.palette.common.black,
        color: theme.palette.common.white,
        borderRadius: 4,
        padding: 10,
        maxWidth: 260,
    },
    arrow: {
        color: theme.palette.common.black,
    },
    connectWallet: {
        '& > .MuiButton-startIcon': {
            lineHeight: 1,
        },
    },
}))

export interface ChainBoundaryProps<T extends NetworkPluginID> extends withClasses<'switchButton'> {
    className?: string
    /** The expected network plugin ID */
    expectedPluginID: T
    /** The expected sub-network under the network plugin */
    expectedChainId: Web3Helper.Definition[T]['ChainId']
    expectedAccount?: string
    hiddenConnectButton?: boolean
    forceShowingWrongNetworkButton?: boolean
    children?: React.ReactNode
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
    actualNetworkPluginID?: T
    disableConnectWallet?: boolean
}

export function ChainBoundaryWithoutContext<T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    const {
        expectedPluginID,
        expectedChainId,
        expectedAccount,
        actualNetworkPluginID,
        forceShowingWrongNetworkButton = false,
        disableConnectWallet = false,
    } = props

    const t = useSharedTrans()
    const { classes } = useStyles(undefined, { props })

    const { pluginID: actualPluginID } = useNetworkContext(actualNetworkPluginID)

    const { account } = useChainContext({ account: expectedAccount })

    const expectedUtils = useWeb3Utils(expectedPluginID)
    const expectedAllowTestnet = useAllowTestnet(expectedPluginID)

    const chainIdValid = useChainIdValid(actualPluginID)

    const expectedNetworkDescriptor = useNetworkDescriptor(expectedPluginID, expectedChainId)
    const expectedChainAllowed = expectedUtils.chainResolver.isValidChainId(expectedChainId, expectedAllowTestnet)

    const isPluginIDMatched = actualPluginID === expectedPluginID

    const renderBox = (children?: React.ReactNode, tips?: string) => {
        return (
            <ShadowRootTooltip
                title={tips ?? ''}
                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                arrow
                placement="top">
                <Box className={props.className} display="flex" flexDirection="column" width="100%">
                    {children}
                </Box>
            </ShadowRootTooltip>
        )
    }

    if (!chainIdValid && !expectedChainAllowed && forceShowingWrongNetworkButton)
        return renderBox(
            !props.hiddenConnectButton ?
                <ActionButton
                    fullWidth
                    startIcon={<Icons.Wallet size={18} />}
                    onClick={() => SelectProviderModal.open()}
                    {...props.ActionButtonPromiseProps}>
                    {t.plugin_wallet_wrong_network()}
                </ActionButton>
            :   null,
        )

    // No wallet connected
    if (!account && !disableConnectWallet)
        return renderBox(
            !props.hiddenConnectButton ?
                <ActionButton
                    className={classes.connectWallet}
                    fullWidth
                    startIcon={<Icons.Wallet size={18} />}
                    onClick={() => SelectProviderModal.open()}
                    {...props.ActionButtonPromiseProps}>
                    {t.plugin_wallet_connect_a_wallet()}
                </ActionButton>
            :   null,
        )

    // Network mismatch
    if (!isPluginIDMatched) {
        return renderBox(
            <ActionButton
                fullWidth
                className={classes.switchButton}
                startIcon={<WalletIcon mainIcon={expectedNetworkDescriptor?.icon} size={18} />}
                sx={props.ActionButtonPromiseProps?.sx}
                onClick={() => SelectProviderModal.open()}
                {...props.ActionButtonPromiseProps}>
                {t.plugin_wallet_change_wallet()}
            </ActionButton>,
            t.plugin_wallet_not_support_network(),
        )
    }

    return props.children
}

export const ChainBoundary = memo(function <T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    return (
        <RevokeChainContextProvider>
            <ChainBoundaryWithoutContext {...props} />
        </RevokeChainContextProvider>
    )
})

ChainBoundary.displayName = 'ChainBoundary'
