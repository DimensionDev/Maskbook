import React, { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { delay } from '@masknet/kit'
import { Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip, ActionButton, useCustomSnackbar } from '@masknet/theme'
import {
    useNetworkContext,
    useChainContext,
    useNetworkDescriptor,
    useAllowTestnet,
    useChainIdValid,
    ActualChainContextProvider,
    useWeb3Others,
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { WalletIcon } from '../WalletIcon/index.js'
import { type ActionButtonPromiseProps } from '../ActionButton/index.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useSharedI18N } from '../../../locales/index.js'
import { SelectProviderDialog } from '../../../index.js'

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
    switchText?: string
    disableConnectWallet?: boolean
}

export function ChainBoundaryWithoutContext<T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    const {
        expectedPluginID,
        expectedChainId,
        expectedAccount,
        actualNetworkPluginID,
        switchText,
        forceShowingWrongNetworkButton = false,
        disableConnectWallet = false,
        predicate = (actualPluginID, actualChainId) =>
            actualPluginID === expectedPluginID && actualChainId === expectedChainId,
    } = props

    const t = useSharedI18N()
    const { classes } = useStyles(undefined, { props })

    const { pluginID: actualPluginID } = useNetworkContext(actualNetworkPluginID)

    const Web3 = useWeb3Connection(actualPluginID)

    const { showSnackbar } = useCustomSnackbar()
    const {
        account,
        chainId: actualChainId,
        providerType: actualProviderType,
    } = useChainContext({ account: expectedAccount })

    const expectedOthers = useWeb3Others(expectedPluginID)
    const expectedAllowTestnet = useAllowTestnet(expectedPluginID)

    const chainIdValid = useChainIdValid(actualPluginID)

    const expectedChainName = expectedOthers.chainResolver.chainName(expectedChainId)
    const expectedNetworkDescriptor = useNetworkDescriptor(expectedPluginID, expectedChainId)
    const expectedChainAllowed = expectedOthers.chainResolver.isValid(expectedChainId, expectedAllowTestnet)

    const isPluginIDMatched = actualPluginID === expectedPluginID
    const isMatched = predicate(actualPluginID, actualChainId)

    const [{ loading }, onSwitchChain] = useAsyncFn(async () => {
        try {
            if (actualProviderType !== ProviderType.WalletConnect || isMatched || !expectedChainAllowed) return
            await Web3.switchChain?.(expectedChainId)
            await delay(1500)

            return 'complete'
        } catch (error) {
            if (
                error instanceof Error &&
                (error.message === 'Chain currently not supported' || error.message === 'Invalid Request')
            ) {
                showSnackbar(t.plugin_wallet_switch_network_title(), {
                    processing: false,
                    variant: 'error',
                    message: t.plugin_wallet_unsupported_chain({ network: expectedChainName ?? '' }),
                    autoHideDuration: 5000,
                })
            }
            return 'failed'
        }
    }, [expectedChainAllowed, isMatched, expectedChainId, actualProviderType, Web3, expectedChainName])

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

    if (isMatched) return <>{props.children}</>

    if (!chainIdValid && !expectedChainAllowed && forceShowingWrongNetworkButton)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        fullWidth
                        startIcon={<Icons.ConnectWallet size={18} />}
                        onClick={() => SelectProviderDialog.open()}
                        {...props.ActionButtonPromiseProps}>
                        {t.plugin_wallet_wrong_network()}
                    </ActionButton>
                ) : null}
            </>,
        )

    // No wallet connected
    if (!account && !disableConnectWallet)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        className={classes.connectWallet}
                        fullWidth
                        startIcon={<Icons.ConnectWallet size={18} />}
                        onClick={() => SelectProviderDialog.open()}
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
                onClick={() => SelectProviderDialog.open()}
                {...props.ActionButtonPromiseProps}>
                {t.plugin_wallet_change_wallet()}
            </ActionButton>,
            actualProviderType === ProviderType.WalletConnect
                ? t.plugin_wallet_connect_tips()
                : t.plugin_wallet_not_support_network(),
        )
    }

    // Provider is Wallet Connect
    if (actualProviderType === ProviderType.WalletConnect && !isMatched) {
        return renderBox(
            <ActionButton
                startIcon={
                    <WalletIcon
                        mainIcon={expectedNetworkDescriptor?.icon} // switch the icon to meet design
                        size={18}
                    />
                }
                onClick={onSwitchChain}
                loading={loading}
                className={classes.switchButton}
                sx={props.ActionButtonPromiseProps?.sx}
                {...props.ActionButtonPromiseProps}>
                {switchText ?? t.plugin_wallet_switch_network({ network: expectedChainName ?? '' })}
            </ActionButton>,
            t.plugin_wallet_connect_tips(),
        )
    }

    return <>{props.children}</>
}

export const ChainBoundary = memo(function <T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    return (
        <ActualChainContextProvider>
            <ChainBoundaryWithoutContext {...props} />
        </ActualChainContextProvider>
    )
})

ChainBoundary.displayName = 'ChainBoundary'
