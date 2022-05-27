import React, { useCallback, useMemo } from 'react'
import { Box, Typography, Theme, useTheme } from '@mui/material'
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
    getChainDetailed,
    getChainDetailedCAIP,
    getChainName,
    getNetworkTypeFromChainId,
    isChainIdValid,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    useAllowTestnet,
    useChainId,
} from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { delay } from '@dimensiondev/kit'
import { SharedTrans, useSharedI18N } from '../../../locales'
import { WalletMessages } from '@masknet/plugin-wallet'
import ActionButton, { ActionButtonPromise, ActionButtonPromiseProps } from '../ActionButton'
import { PluginWalletConnectIcon } from '@masknet/icons'
import {
    sharedProviderType,
    useAddEthereumChain,
    useGetChainId,
    useSwitchEthereumChain,
    WalletIcon,
    WalletStatusBar,
    WalletStatusBarProps,
} from '@masknet/shared'
const useStyles = makeStyles()((theme) => ({
    action: {
        textAlign: 'center',
        margin: theme.spacing(1),
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
    },
    tooltip: {
        borderRadius: 4,
        padding: 10,
    },
}))

export interface ChainBoundaryProps extends withClasses<'switchButton'> {
    className?: string
    chainId: ChainId
    noSwitchNetworkTip?: boolean
    disablePadding?: boolean
    hiddenConnectButton?: boolean
    switchButtonStyle?: SxProps<Theme>
    children?: React.ReactNode
    isValidChainId?: (actualChainId: ChainId, expectedChainId: ChainId) => boolean
    renderInTimeline?: boolean
    updateAccount?: (options: {
        name?: string
        account?: string
        chainId?: ChainId
        networkType?: NetworkType
        providerType?: ProviderType
    }) => Promise<void>
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
    walletStatusBarProps?: Partial<WalletStatusBarProps>
}

export function ChainBoundary(props: ChainBoundaryProps) {
    const { updateAccount, walletStatusBarProps } = props
    const t = useSharedI18N()
    const theme = useTheme()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const plugin = useActivatedPlugin(pluginID, 'any')

    const account = useAccount()
    const chainId = useChainId()
    const providerType = sharedProviderType.value
    const allowTestnet = useAllowTestnet()

    const { noSwitchNetworkTip = true } = props
    const classes = useStylesExtends(useStyles(), props)
    const expectedChainId = props.chainId
    const expectedNetwork = getChainDetailed(expectedChainId)?.chain ?? getChainName(expectedChainId)
    const actualChainId = chainId
    const actualNetwork = getChainDetailed(actualChainId)?.chain ?? getChainName(actualChainId)

    const overrides = useMemo(() => {
        return {
            chainId: expectedChainId,
            providerType: providerType as ProviderType,
        }
    }, [chainId, providerType])
    const [, switchEthereumChain] = useSwitchEthereumChain(overrides)
    const [, addEthereumChain] = useAddEthereumChain(overrides)
    const [, getChainId] = useGetChainId(overrides)

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
                await updateAccount?.({
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
                        ? switchEthereumChain(expectedChainId)
                        : addEthereumChain(chainDetailedCAIP, account),
                ])

                // recheck
                const chainIdHex = await getChainId()
                if (Number.parseInt(chainIdHex, 16) !== expectedChainId) throw new Error('Failed to switch chain.')
            } catch {
                throw new Error(
                    `Switch Chain Error: Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`,
                )
            }
        }

        if (providerType === ProviderType.WalletConnect && networkType) {
            openSelectProviderDialog()
            return
        }

        if (!isPluginMatched) {
            openSelectProviderDialog()
            return
        }
        if (!isChainMatched) await switchToChain()
    }, [account, isAllowed, isChainMatched, isPluginMatched, providerType, expectedChainId])

    // TODO: will remove this and extract new boundary for timeline
    const buttonProps = useMemo(() => {
        return {
            ...(props.renderInTimeline
                ? {
                      variant: 'contained',
                      fullWidth: true,
                      sx: {
                          backgroundColor: '#07101B',
                          color: '#FFFFFF',
                          '&:hover': {
                              backgroundColor: '#07101B',
                          },
                      },
                  }
                : {}),
            ...props.ActionButtonPromiseProps,
        } as Partial<ActionButtonPromiseProps>
    }, [props.ActionButtonPromiseProps, props.renderInTimeline])

    const renderBox = (children?: React.ReactNode, tips?: string | React.ReactElement) => {
        return (
            <ShadowRootTooltip title={tips ?? ''} classes={{ tooltip: classes.tooltip }} arrow placement="top">
                <Box className={props.className} sx={{ flex: 1 }} display="flex" flexDirection="column">
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
                        fullWidth
                        startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                        variant="contained"
                        size={props.ActionButtonPromiseProps?.size}
                        sx={{ marginTop: 1.5 }}
                        onClick={openSelectProviderDialog}
                        {...buttonProps}>
                        {t.plugin_wallet_connect_wallet()}
                    </ActionButton>
                ) : null}
            </>,
        )

    if ((isChainMatched && isPluginMatched) || isValid) return <>{props.children}</>

    if (!isAllowed)
        return renderBox(
            <Typography color={MaskColorVar.textPluginColor} sx={{ paddingBottom: 1 }}>
                <span>
                    {t.plugin_wallet_not_available_on({
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
                            {t.plugin_wallet_not_available_on({
                                network: plugin?.name?.fallback ?? 'Unknown Plugin',
                            })}
                        </span>
                    </Typography>
                ) : null}
                {isAllowed ? (
                    props.renderInTimeline ? (
                        <ActionButtonPromise
                            className={classes.switchButton}
                            startIcon={
                                <WalletIcon
                                    networkIcon={networkDescriptor?.icon} // switch the icon to meet design
                                    isBorderColorNotDefault
                                    size={18}
                                />
                            }
                            sx={props.switchButtonStyle}
                            init={
                                <span>
                                    {t.plugin_wallet_connect_network({
                                        network: 'EVM',
                                    })}
                                </span>
                            }
                            waiting={t.plugin_wallet_connect_network_under_going({
                                network: 'EVM',
                            })}
                            complete={t.plugin_wallet_connect_network({
                                network: 'EVM',
                            })}
                            failed={t.plugin_wallet_connect_retry()}
                            executor={onSwitchChain}
                            completeOnClick={onSwitchChain}
                            failedOnClick="use executor"
                            fullWidth
                            {...buttonProps}
                        />
                    ) : (
                        <WalletStatusBar
                            {...walletStatusBarProps}
                            actionProps={{
                                startIcon: (
                                    <WalletIcon
                                        networkIcon={networkDescriptor?.icon} // switch the icon to meet design
                                        isBorderColorNotDefault
                                        size={18}
                                    />
                                ),
                                title: t.plugin_wallet_connect_network({
                                    network: 'EVM',
                                }),
                                action: onSwitchChain,
                            }}
                        />
                    )
                ) : null}
            </>,
        )
    }

    return renderBox(
        <>
            {!noSwitchNetworkTip ? (
                <Typography color={MaskColorVar.errorPlugin}>
                    <span>
                        {t.plugin_wallet_not_available_on({
                            network: actualNetwork,
                        })}
                    </span>
                </Typography>
            ) : null}
            {isAllowed ? (
                props.renderInTimeline ? (
                    <ActionButtonPromise
                        startIcon={
                            <WalletIcon
                                networkIcon={networkDescriptor?.icon} // switch the icon to meet design
                                isBorderColorNotDefault
                                size={18}
                            />
                        }
                        sx={props.switchButtonStyle}
                        init={
                            <span>
                                {t.plugin_wallet_switch_network({ network: expectedNetwork.replace('Mainnet', '') })}
                            </span>
                        }
                        waiting={t.plugin_wallet_switch_network_under_going({
                            network: expectedNetwork.replace('Mainnet', ''),
                        })}
                        complete={t.plugin_wallet_switch_network({
                            network: expectedNetwork.replace('Mainnet', ''),
                        })}
                        failed={t.plugin_wallet_connect_retry()}
                        executor={onSwitchChain}
                        completeOnClick={onSwitchChain}
                        failedOnClick="use executor"
                        fullWidth
                        {...buttonProps}
                    />
                ) : (
                    <WalletStatusBar
                        {...walletStatusBarProps}
                        actionProps={{
                            startIcon: (
                                <WalletIcon
                                    networkIcon={networkDescriptor?.icon} // switch the icon to meet design
                                    isBorderColorNotDefault
                                    size={18}
                                />
                            ),

                            title:
                                providerType === ProviderType.WalletConnect
                                    ? t.plugin_wallet_change_network({
                                          network: expectedNetwork.replace('Mainnet', ''),
                                      })
                                    : t.plugin_wallet_switch_network({
                                          network: expectedNetwork.replace('Mainnet', ''),
                                      }),
                            waiting: t.plugin_wallet_switch_network_under_going({
                                network: expectedNetwork.replace('Mainnet', ''),
                            }),

                            action: onSwitchChain,
                        }}
                    />
                )
            ) : null}
        </>,
        providerType === ProviderType.WalletConnect ? (
            <SharedTrans.plugin_wallet_connect_tips
                components={{
                    br: <br />,
                }}
            />
        ) : (
            ''
        ),
    )
}
