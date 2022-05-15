import React, { useCallback } from 'react'
import { Box, Typography, Theme } from '@mui/material'
import { makeStyles, MaskColorVar, ShadowRootTooltip, useStylesExtends } from '@masknet/theme'
import type { SxProps } from '@mui/system'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import {
    NetworkPluginID,
    useCurrentWeb3NetworkPluginID,
    useAccount,
    useNetworkDescriptor,
} from '@masknet/plugin-infra/web3'
import {
    ChainId,
    getChainDetailedCAIP,
    getChainName,
    getNetworkTypeFromChainId,
    isChainIdValid,
    isValidAddress as isValidEthereumAddress,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    useAllowTestnet,
    useChainId,
} from '@masknet/web3-shared-evm'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { delay } from '@dimensiondev/kit'
import ActionButton, {
    ActionButtonPromise,
    ActionButtonPromiseProps,
} from '../../extension/options-page/DashboardComponents/ActionButton'
import { currentProviderSettings } from '../../plugins/Wallet/settings'
import { useI18N } from '../../utils'
import { WalletMessages, WalletRPC } from '../../plugins/Wallet/messages'
import Services from '../../extension/service'
import { pluginIDSettings } from '../../settings/settings'
import { WalletIcon } from '@masknet/shared'
import { PluginWalletConnectIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: MaskColorVar.buttonPluginBackground,
        color: 'white',
        width: 254,
        '&,&:hover': {
            background: MaskColorVar.buttonPluginBackground,
        },
        borderRadius: 9999,
    },
    action: {
        textAlign: 'center',
        margin: theme.spacing(1),
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottoma: 48,
    },
}))

const PLUGINID_NAME: Record<NetworkPluginID, string> = {
    'com.mask.evm': 'EVM',
    'com.mask.flow': 'Flow',
    'com.mask.solana': 'Solana',
}

export interface EthereumChainBoundaryProps extends withClasses<'switchButton'> {
    className?: string
    chainId: ChainId
    noSwitchNetworkTip?: boolean
    disablePadding?: boolean
    hiddenConnectButton?: boolean
    switchButtonStyle?: SxProps<Theme>
    children?: React.ReactNode
    isValidChainId?: (actualChainId: ChainId, expectedChainId: ChainId) => boolean
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const { t } = useI18N()

    const pluginID = useCurrentWeb3NetworkPluginID()
    const plugin = useActivatedPlugin(pluginID, 'any')

    const account = useAccount()
    const chainId = useChainId()

    const allowTestnet = useAllowTestnet()
    const providerType = useValueRef(currentProviderSettings)

    const { noSwitchNetworkTip = true } = props
    const classes = useStylesExtends(useStyles(), props)
    const expectedChainId = props.chainId
    const expectedNetwork = getChainName(expectedChainId)

    const actualChainId = chainId
    const actualNetwork = getChainName(actualChainId)

    // if false then it will not guide the user to switch the network
    const isAllowed =
        isChainIdValid(expectedChainId, allowTestnet) &&
        !!account &&
        providerType !== ProviderType.Coin98 &&
        providerType !== ProviderType.Fortmatic

    // is the actual chain id matched with the expected one?
    const isChainMatched = actualChainId === expectedChainId
    const isPluginMatched = pluginID === NetworkPluginID.PLUGIN_EVM

    // is the actual chain id a valid one even if it does not match with the expected one?
    const isValid = props?.isValidChainId?.(actualChainId, expectedChainId) ?? false

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    // #region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    // #endregion
    const networkDescriptor = useNetworkDescriptor(expectedChainId, NetworkPluginID.PLUGIN_EVM)
    // request ethereum-compatible network
    const networkType = getNetworkTypeFromChainId(expectedChainId)

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

                // recheck
                const chainIdHex = await Services.Ethereum.getChainId(overrides)
                if (Number.parseInt(chainIdHex, 16) !== expectedChainId) throw new Error('Failed to switch chain.')
            } catch {
                throw new Error(
                    `Switch Chain Error: Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`,
                )
            }
        }

        const switchToPlugin = async () => {
            pluginIDSettings.value = NetworkPluginID.PLUGIN_EVM
        }

        if (providerType === ProviderType.WalletConnect && networkType) {
            openSelectProviderDialog()
            return
        }

        if (!isChainMatched) await switchToChain()
        if (!isPluginMatched) {
            await switchToPlugin()
            if (!networkType || networkType !== NetworkType.Ethereum || isValidEthereumAddress(account)) return
            setConnectWalletDialog({
                open: true,
                providerType: ProviderType.MetaMask,
                networkType,
            })
        }
    }, [account, isAllowed, isChainMatched, isPluginMatched, providerType, expectedChainId])

    const renderBox = (children?: React.ReactNode, tips?: string) => {
        return (
            <ShadowRootTooltip title={tips ?? ''} arrow>
                <Box
                    className={props.className}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    style={{ padding: 12 }}>
                    {children}
                </Box>
            </ShadowRootTooltip>
        )
    }

    if (!account)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        startIcon={<PluginWalletConnectIcon />}
                        variant="contained"
                        size={props.ActionButtonPromiseProps?.size}
                        sx={{
                            backgroundColor: MaskColorVar.buttonPluginBackground,
                            width: '100%',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: MaskColorVar.buttonPluginBackground,
                            },
                        }}
                        onClick={openSelectProviderDialog}>
                        {t('plugin_wallet_connect_wallet')}
                    </ActionButton>
                ) : null}
            </>,
        )

    if ((isChainMatched && isPluginMatched) || isValid) return <>{props.children}</>

    if (!isAllowed)
        return renderBox(
            <Typography color={MaskColorVar.textPluginColor} sx={{ paddingBottom: 1 }}>
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
                    <Typography color={MaskColorVar.errorPlugin}>
                        <span>
                            {t('plugin_wallet_not_available_on', {
                                network: plugin?.name?.fallback ?? 'Unknown Plugin',
                            })}
                        </span>
                    </Typography>
                ) : null}
                {isAllowed ? (
                    <ActionButtonPromise
                        className={classes.switchButton}
                        startIcon={
                            <WalletIcon
                                networkIcon={networkDescriptor?.icon} // switch the icon to meet design
                                isBorderColorNotDefault
                            />
                        }
                        sx={
                            props.switchButtonStyle ?? {
                                backgroundColor: MaskColorVar.textPluginColor,
                                width: '100%',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: MaskColorVar.buttonPluginBackground,
                                },
                            }
                        }
                        init={
                            <span>
                                {t('plugin_wallet_connect_network', {
                                    network: PLUGINID_NAME[NetworkPluginID.PLUGIN_EVM],
                                })}
                            </span>
                        }
                        waiting={t('plugin_wallet_connect_network_under_going', {
                            network: PLUGINID_NAME[NetworkPluginID.PLUGIN_EVM],
                        })}
                        complete={t('plugin_wallet_connect_network', {
                            network: PLUGINID_NAME[NetworkPluginID.PLUGIN_EVM],
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
                <Typography color={MaskColorVar.errorPlugin}>
                    <span>
                        {t('plugin_wallet_not_available_on', {
                            network: actualNetwork,
                        })}
                    </span>
                </Typography>
            ) : null}
            {isAllowed ? (
                <ActionButtonPromise
                    startIcon={
                        <WalletIcon
                            networkIcon={networkDescriptor?.icon} // switch the icon to meet design
                            isBorderColorNotDefault
                        />
                    }
                    sx={
                        props.switchButtonStyle ?? {
                            backgroundColor: MaskColorVar.buttonPluginBackground,
                            width: '100%',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: MaskColorVar.buttonPluginBackground,
                            },
                            padding: 1,
                            margin: 0,
                        }
                    }
                    style={{ borderRadius: 10 }}
                    init={<span>{t('plugin_wallet_switch_network')}</span>}
                    waiting={t('plugin_wallet_switch_network_under_going')}
                    complete={t('plugin_wallet_switch_network')}
                    failed={t('retry')}
                    executor={onSwitchChain}
                    completeOnClick={onSwitchChain}
                    failedOnClick="use executor"
                    {...props.ActionButtonPromiseProps}
                />
            ) : null}
        </>,
        providerType === ProviderType.WalletConnect ? t('plugin_wallet_connect_tips') : '',
    )
}
