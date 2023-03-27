import React, { memo, useCallback } from 'react'
import { Box } from '@mui/material'
import { makeStyles, ShadowRootTooltip, ActionButton } from '@masknet/theme'
import {
    useNetworkContext,
    useChainContext,
    useNetworkDescriptor,
    useAllowTestnet,
    useWeb3State,
    useChainIdValid,
    useProviderDescriptor,
    ActualChainContextProvider,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletIcon } from '../WalletIcon/index.js'
import { type ActionButtonPromiseProps } from '../ActionButton/index.js'
import { Icons } from '@masknet/icons'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useSharedI18N } from '../../../locales/index.js'
import { WalletMessages } from '@masknet/plugin-wallet'

const useStyles = makeStyles()((theme) => ({
    tooltip: {
        background: theme.palette.common.black,
        color: theme.palette.common.white,
        borderRadius: 4,
        padding: 10,
        maxWidth: 260,
    },
    connectWallet: {
        '& > .MuiButton-startIcon': {
            lineHeight: 1,
        },
    },
}))

export interface ChainBoundaryProps<T extends NetworkPluginID> extends withClasses<'switchButton'> {
    /** The expected network plugin ID */
    expectedPluginID: T
    /** The expected sub-network under the network plugin */
    expectedChainId: Web3Helper.Definition[T]['ChainId']
    /** Judge the network is available for children components */
    predicate?: (actualPluginID: NetworkPluginID, actualChainId: Web3Helper.Definition[T]['ChainId']) => boolean
    expectedAccount?: string
    className?: string
    hiddenConnectButton?: boolean
    switchChainWithoutPopup?: boolean
    forceShowingWrongNetworkButton?: boolean
    children?: React.ReactNode
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
    actualNetworkPluginID?: T
}

export function ChainBoundaryWithoutContext<T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    const {
        expectedPluginID,
        expectedChainId,
        expectedAccount,
        actualNetworkPluginID,
        forceShowingWrongNetworkButton = false,
        predicate = (actualPluginID, actualChainId) =>
            actualPluginID === expectedPluginID && actualChainId === expectedChainId,
    } = props

    const t = useSharedI18N()
    const { classes } = useStyles(undefined, { props })

    const { pluginID: actualPluginID } = useNetworkContext(actualNetworkPluginID)
    const plugin = useActivatedPlugin(actualPluginID, 'any')
    const expectedPlugin = useActivatedPlugin(expectedPluginID, 'any')

    const { Others: actualOthers } = useWeb3State(actualPluginID)

    const {
        account,
        chainId: actualChainId,
        providerType: actualProviderType,
    } = useChainContext({ account: expectedAccount })
    const actualProviderDescriptor = useProviderDescriptor(actualPluginID)
    const actualChainName = actualOthers?.chainResolver.chainName(actualChainId)

    const { Others: expectedOthers } = useWeb3State(expectedPluginID)
    const expectedAllowTestnet = useAllowTestnet(expectedPluginID)

    const chainIdValid = useChainIdValid(actualPluginID)

    const expectedChainName = expectedOthers?.chainResolver.chainName(expectedChainId)
    const expectedNetworkDescriptor = useNetworkDescriptor(expectedPluginID, expectedChainId)
    const expectedChainAllowed = expectedOthers?.chainResolver.isValid(expectedChainId, expectedAllowTestnet)

    const isPluginIDMatched = actualPluginID === expectedPluginID
    const isMatched = predicate(actualPluginID, actualChainId)

    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const openSelectProviderDialog = useCallback(() => {
        setSelectProviderDialog({
            open: true,
            network: expectedNetworkDescriptor,
        })
    }, [expectedNetworkDescriptor])

    const renderBox = (children?: React.ReactNode, tips?: string) => {
        return (
            <ShadowRootTooltip title={tips ?? ''} classes={{ tooltip: classes.tooltip }} arrow placement="top">
                <Box className={props.className} display="flex" flexDirection="column" width="100%">
                    {children}
                </Box>
            </ShadowRootTooltip>
        )
    }

    if (!chainIdValid && !expectedChainAllowed && forceShowingWrongNetworkButton)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        fullWidth
                        startIcon={<Icons.ConnectWallet size={18} />}
                        onClick={openSelectProviderDialog}
                        {...props.ActionButtonPromiseProps}>
                        {t.plugin_wallet_wrong_network()}
                    </ActionButton>
                ) : null}
            </>,
        )

    // No wallet connected
    if (!account)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        className={classes.connectWallet}
                        fullWidth
                        startIcon={<Icons.ConnectWallet size={18} />}
                        onClick={openSelectProviderDialog}
                        {...props.ActionButtonPromiseProps}>
                        {t.plugin_wallet_connect_a_wallet()}
                    </ActionButton>
                ) : null}
            </>,
        )

    // Network mismatch
    if (!isPluginIDMatched) {
        return renderBox(
            <ActionButton
                fullWidth
                className={classes.switchButton}
                disabled={actualProviderType === ProviderType.WalletConnect}
                startIcon={
                    <WalletIcon
                        mainIcon={expectedNetworkDescriptor?.icon} // switch the icon to meet design
                        size={18}
                    />
                }
                sx={props.ActionButtonPromiseProps?.sx}
                onClick={openSelectProviderDialog}
                {...props.ActionButtonPromiseProps}>
                {t.plugin_wallet_change_wallet()}
            </ActionButton>,
            actualProviderType === ProviderType.WalletConnect ? t.plugin_wallet_connect_tips() : '',
        )
    }

    // Provider is Wallet Connect
    if (actualProviderType === ProviderType.WalletConnect) {
        return renderBox(
            <ActionButton
                startIcon={
                    <WalletIcon
                        mainIcon={expectedNetworkDescriptor?.icon} // switch the icon to meet design
                        size={18}
                    />
                }
                disabled
                className={classes.switchButton}
                sx={props.ActionButtonPromiseProps?.sx}
                {...props.ActionButtonPromiseProps}>
                {t.plugin_wallet_switch_network({ network: expectedChainName ?? '' })}
            </ActionButton>,
            t.plugin_wallet_connect_tips(),
        )
    }

    return <>{props.children}</>
}

ChainBoundaryWithoutContext.displayName = 'ChainBoundaryWithoutContext'

export const ChainBoundary = memo(function <T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    return (
        <ActualChainContextProvider>
            <ChainBoundaryWithoutContext {...props} />
        </ActualChainContextProvider>
    )
})

ChainBoundary.displayName = 'ChainBoundary'
