import React, { useCallback } from 'react'
import { Box, Typography, Theme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { SxProps } from '@mui/system'
import { NetworkPluginID, useActivatedPlugin, usePluginIDContext } from '@masknet/plugin-infra'
import {
    ChainId,
    getChainDetailedCAIP,
    getChainName,
    getNetworkTypeFromChainId,
    isChainIdValid,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    useAccount,
    useAllowTestnet,
    useChainId,
} from '@masknet/web3-shared-evm'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared'
import { delay } from '@masknet/shared-base'
import ActionButton, {
    ActionButtonPromise,
    ActionButtonPromiseProps,
} from '../../extension/options-page/DashboardComponents/ActionButton'
import { currentProviderSettings } from '../../plugins/Wallet/settings'
import { useI18N } from '../../utils'
import { WalletMessages, WalletRPC } from '../../plugins/Wallet/messages'
import Services from '../../extension/service'
import { pluginIDSettings } from '../../settings/settings'

const useStyles = makeStyles()(() => ({}))

export interface EthereumChainBoundaryProps extends withClasses<'switchButton'> {
    chainId: ChainId
    noSwitchNetworkTip?: boolean
    disablePadding?: boolean
    switchButtonStyle?: SxProps<Theme>
    children?: React.ReactNode
    isValidChainId?: (actualChainId: ChainId, expectedChainId: ChainId) => boolean
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const { t } = useI18N()

    const pluginID = usePluginIDContext()
    const plugin = useActivatedPlugin(pluginID)

    const account = useAccount()
    const chainId = useChainId()
    const allowTestnet = useAllowTestnet()
    const providerType = useValueRef(currentProviderSettings)

    const { noSwitchNetworkTip = false } = props
    const classes = useStylesExtends(useStyles(), props)
    const expectedChainId = props.chainId
    const expectedNetwork = getChainName(expectedChainId)

    const actualChainId = chainId
    const actualNetwork = getChainName(actualChainId)

    // if false then it will not guide the user to switch the network
    const isAllowed = isChainIdValid(expectedChainId, allowTestnet) && !!account && providerType !== ProviderType.Coin98

    // is the actual chain id matched with the expected one?
    const isChainMatched = actualChainId === expectedChainId
    const isPluginMatched = pluginID === NetworkPluginID.PLUGIN_EVM

    // is the actual chain id a valid one even if it does not match with the expected one?
    const isValid = props?.isValidChainId?.(actualChainId, expectedChainId) ?? false

    const onSwitchChain = useCallback(async () => {
        // a short time loading makes the user fells better
        await delay(1000)

        if (!isAllowed) return

        const switchToChain = async () => {
            // read the chain detailed from the built-in chain list
            const chainDetailedCAIP = getChainDetailedCAIP(expectedChainId)
            if (!chainDetailedCAIP) throw new Error('Unknown network type.')

            // if mask wallet was used it can switch network automatically
            if (providerType === ProviderType.MaskWallet) {
                await WalletRPC.updateAccount({
                    chainId: expectedChainId,
                })
                return
            }

            // request ethereum-compatible network
            const networkType = getNetworkTypeFromChainId(expectedChainId)
            if (!networkType) return
            try {
                const overrides = {
                    chainId: expectedChainId,
                    providerType,
                }
                await Promise.race([
                    (async () => {
                        await delay(30 /* seconds */ * 1000 /* milliseconds */)
                        throw new Error('Timeout!')
                    })(),
                    networkType === NetworkType.Ethereum
                        ? Services.Ethereum.switchEthereumChain(expectedChainId, overrides)
                        : Services.Ethereum.addEthereumChain(chainDetailedCAIP, account, overrides),
                ])
            } catch {
                throw new Error(`Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`)
            }
        }

        const switchToPlugin = async () => {
            pluginIDSettings.value = NetworkPluginID.PLUGIN_EVM
        }

        if (!isChainMatched) await switchToChain()
        if (!isPluginMatched) await switchToPlugin()
    }, [account, isAllowed, isChainMatched, isPluginMatched, providerType, expectedChainId])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const renderBox = (children?: React.ReactNode) => {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={!props.disablePadding ? { paddingTop: 1, paddingBottom: 1 } : null}>
                {children}
            </Box>
        )
    }

    if (!account)
        return renderBox(
            <>
                <Typography color="textPrimary">
                    <span>{t('plugin_wallet_connect_wallet_tip')}</span>
                </Typography>
                <ActionButton
                    variant="contained"
                    size="small"
                    sx={{ marginTop: 1.5 }}
                    onClick={openSelectProviderDialog}>
                    {t('plugin_wallet_connect_wallet')}
                </ActionButton>
            </>,
        )

    if ((isChainMatched && isPluginMatched) || isValid) return <>{props.children}</>

    if (!isAllowed)
        return renderBox(
            <Typography color="textPrimary">
                <span>
                    {t('plugin_wallet_not_available_on', {
                        network: actualNetwork,
                    })}
                </span>
            </Typography>,
        )

    if (pluginID !== NetworkPluginID.PLUGIN_EVM) {
        return renderBox(
            <>
                {!noSwitchNetworkTip ? (
                    <Typography color="textPrimary">
                        <span>
                            {t('plugin_wallet_not_available_on', {
                                network: plugin?.name?.fallback ?? 'Unknown Plugin',
                            })}
                        </span>
                    </Typography>
                ) : null}
                {isAllowed ? (
                    <ActionButtonPromise
                        variant="contained"
                        size="small"
                        className={classes.switchButton}
                        sx={props.switchButtonStyle ?? { marginTop: 1.5 }}
                        init={
                            <span>
                                {t('plugin_wallet_switch_network', {
                                    network: expectedNetwork,
                                })}
                            </span>
                        }
                        waiting={t('plugin_wallet_switch_network_under_going', {
                            network: expectedNetwork,
                        })}
                        complete={t('plugin_wallet_switch_network', {
                            network: expectedNetwork,
                        })}
                        failed={t('retry')}
                        executor={onSwitchChain}
                        completeOnClick={onSwitchChain}
                        failedOnClick="use executor"
                        {...props.ActionButtonPromiseProps}
                    />
                ) : null}
            </>,
        )
    }

    return renderBox(
        <>
            {!noSwitchNetworkTip ? (
                <Typography color="textPrimary">
                    <span>
                        {t('plugin_wallet_not_available_on', {
                            network: actualNetwork,
                        })}
                    </span>
                </Typography>
            ) : null}
            {isAllowed ? (
                <ActionButtonPromise
                    variant="contained"
                    size="small"
                    className={classes.switchButton}
                    sx={props.switchButtonStyle ?? { marginTop: 1.5 }}
                    init={
                        <span>
                            {t('plugin_wallet_switch_network', {
                                network: expectedNetwork,
                            })}
                        </span>
                    }
                    waiting={t('plugin_wallet_switch_network_under_going', {
                        network: expectedNetwork,
                    })}
                    complete={t('plugin_wallet_switch_network', {
                        network: expectedNetwork,
                    })}
                    failed={t('retry')}
                    executor={onSwitchChain}
                    completeOnClick={onSwitchChain}
                    failedOnClick="use executor"
                    {...props.ActionButtonPromiseProps}
                />
            ) : null}
        </>,
    )
}
