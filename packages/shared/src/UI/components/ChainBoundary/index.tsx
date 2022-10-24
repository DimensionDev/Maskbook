import React, { useCallback, useMemo, cloneElement, Children, DetailedReactHTMLElement, isValidElement } from 'react'
import { useAsyncFn } from 'react-use'
import { Box, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, ShadowRootTooltip, useStylesExtends, ActionButton } from '@masknet/theme'
import {
    useNetworkContext,
    useAccount,
    useNetworkDescriptor,
    useAllowTestnet,
    useWeb3State,
    useWeb3Connection,
    useProviderDescriptor,
    useChainId,
    useProviderType,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { delay } from '@dimensiondev/kit'
import { WalletIcon } from '../WalletIcon/index.js'
import { ActionButtonPromise, ActionButtonPromiseProps } from '../ActionButton/index.js'
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
    noSwitchNetworkTip?: boolean
    hiddenConnectButton?: boolean
    switchChainWithoutPopup?: boolean
    children?: React.ReactNode
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
}

export function ChainBoundary<T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    const {
        noSwitchNetworkTip = true,
        expectedPluginID,
        expectedChainId,
        expectedAccount,
        switchChainWithoutPopup = false,
        predicate = (actualPluginID, actualChainId) =>
            actualPluginID === expectedPluginID && actualChainId === expectedChainId,
    } = props

    const t = useSharedI18N()
    const classes = useStylesExtends(useStyles(), props)

    const { pluginID: actualPluginID } = useNetworkContext()
    const plugin = useActivatedPlugin(actualPluginID, 'any')
    const expectedPlugin = useActivatedPlugin(expectedPluginID, 'any')

    const { Others: actualOthers } = useWeb3State(actualPluginID)
    const actualChainId = useChainId(actualPluginID)
    const actualProviderType = useProviderType(actualPluginID)
    const actualProviderDescriptor = useProviderDescriptor(actualPluginID)
    const actualChainName = actualOthers?.chainResolver.chainName(actualChainId)
    const account = useAccount(actualPluginID, expectedAccount)

    const { Others: expectedOthers } = useWeb3State(expectedPluginID)
    const expectedConnection = useWeb3Connection(expectedPluginID)
    const expectedAllowTestnet = useAllowTestnet(expectedPluginID)

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

    const [{ loading }, onSwitchChain] = useAsyncFn(async () => {
        // a short time loading makes the user fells better
        await delay(1000)

        if (!isPluginIDMatched || actualProviderType === ProviderType.WalletConnect) {
            setSelectProviderDialog({
                open: true,
                network: expectedNetworkDescriptor,
            })
            return 'init'
        }
        if (!isMatched) {
            if (switchChainWithoutPopup && actualProviderType === ProviderType.MaskWallet) {
                await expectedConnection?.switchChain?.(expectedChainId)
            } else {
                await expectedConnection?.connect({
                    chainId: expectedChainId,
                })
            }
        }
        return 'complete'
    }, [
        expectedChainAllowed,
        isMatched,
        isPluginIDMatched,
        actualProviderType,
        expectedChainId,
        expectedConnection,
        switchChainWithoutPopup,
    ])

    const switchButtonDisabled = useMemo(() => {
        return !(actualProviderDescriptor?.enableRequirements?.supportedChainIds?.includes(expectedChainId) ?? false)
    }, [expectedChainId, actualProviderDescriptor])

    const renderBox = (children?: React.ReactNode, tips?: string) => {
        return (
            <ShadowRootTooltip title={tips ?? ''} classes={{ tooltip: classes.tooltip }} arrow placement="top">
                <Box className={props.className} display="flex" flexDirection="column" width="100%">
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

    if (isMatched) return <>{props.children}</>

    if (!isPluginIDMatched) {
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

                <ActionButtonPromise
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
                    init={
                        <span>
                            {t.plugin_wallet_connect_network({
                                network:
                                    (expectedChainAllowed ? expectedChainName : expectedPlugin?.name.fallback) ?? '',
                            })}
                        </span>
                    }
                    waiting={t.plugin_wallet_connect_network_under_going({
                        network: (expectedChainAllowed ? expectedChainName : expectedPlugin?.name.fallback) ?? '',
                    })}
                    complete={t.plugin_wallet_connect_network({
                        network: (expectedChainAllowed ? expectedChainName : expectedPlugin?.name.fallback) ?? '',
                    })}
                    failed={t.retry()}
                    executor={onSwitchChain}
                    completeOnClick={onSwitchChain}
                    failedOnClick="use executor"
                    {...props.ActionButtonPromiseProps}
                />
            </>,
            actualProviderType === ProviderType.WalletConnect ? t.plugin_wallet_connect_tips() : '',
        )
    }

    return renderBox(
        <>
            {!noSwitchNetworkTip ? (
                <Typography color={MaskColorVar.errorPlugin}>
                    <span>
                        {t.plugin_wallet_not_available_on({
                            network: actualChainName ?? '',
                        })}
                    </span>
                </Typography>
            ) : null}
            {expectedChainAllowed && !switchChainWithoutPopup ? (
                <ActionButtonPromise
                    fullWidth
                    startIcon={
                        <WalletIcon
                            mainIcon={expectedNetworkDescriptor?.icon} // switch the icon to meet design
                            size={18}
                        />
                    }
                    disabled={actualProviderType === ProviderType.WalletConnect || switchButtonDisabled}
                    sx={props.ActionButtonPromiseProps?.sx}
                    init={<span>{t.plugin_wallet_switch_network({ network: expectedChainName ?? '' })}</span>}
                    waiting={t.plugin_wallet_switch_network_under_going({
                        network: expectedChainName ?? '',
                    })}
                    complete={t.plugin_wallet_switch_network({ network: expectedChainName ?? '' })}
                    failed={t.retry()}
                    executor={onSwitchChain}
                    completeOnClick={onSwitchChain}
                    failedOnClick="use executor"
                    {...props.ActionButtonPromiseProps}
                />
            ) : (
                CopyDeepElementWithEventHandler(
                    props.children,
                    async () => {
                        const result = await onSwitchChain()
                        return result === 'complete'
                    },
                    loading,
                )
            )}
        </>,
        actualProviderType === ProviderType.WalletConnect
            ? t.plugin_wallet_connect_tips()
            : switchButtonDisabled
            ? t.plugin_wallet_not_support_network()
            : '',
    )
}

function CopyDeepElementWithEventHandler(
    children: React.ReactNode,
    injectHandler: () => Promise<boolean>,
    loading: boolean,
): Array<DetailedReactHTMLElement<any, any>> {
    return (
        Children.map(children, (child: any) => {
            const isValid = !isValidElement(child.props?.children)
            return cloneElement(child, {
                onClick: isValid
                    ? async (...args: unknown[]) => {
                          const result = await injectHandler()
                          if (!result) return
                          await child.props.onClick(...args)
                      }
                    : child.props.onClick,
                loading: isValid ? loading || child.props?.loading : child.props?.loading,
                children: isValid
                    ? child.props.children
                    : CopyDeepElementWithEventHandler(child.props?.children, injectHandler, loading),
            })
        }) || []
    ).filter(Boolean)
}
