import React, { useCallback, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, ShadowRootTooltip, useStylesExtends } from '@masknet/theme'
import {
    useCurrentWeb3NetworkPluginID,
    useAccount,
    useNetworkDescriptor,
    useChainId,
    useAllowTestnet,
    useProviderType,
    Web3Helper,
    useWeb3State,
    useWeb3Connection,
    useChainIdValid,
    useProviderDescriptor,
} from '@masknet/plugin-infra/web3'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { delay } from '@dimensiondev/kit'
import ActionButton, {
    ActionButtonPromise,
    ActionButtonPromiseProps,
} from '../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../utils'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { WalletIcon } from '@masknet/shared'
import { PluginWalletConnectIcon } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'

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
        background: theme.palette.common.black,
        color: theme.palette.common.white,
        borderRadius: 4,
        padding: 10,
        maxWidth: 260,
    },
}))

export interface ChainBoundaryProps<T extends NetworkPluginID> extends withClasses<'switchButton'> {
    /** The expected network plugin ID */
    expectedPluginID: T
    /** The expected sub-network under the network plugin */
    expectedChainId: Web3Helper.Definition[T]['ChainId']
    /** Judge the network is available for children components */
    predicate?: (actualPluginID: NetworkPluginID, actualChainId: Web3Helper.Definition[T]['ChainId']) => boolean

    className?: string
    switchChainWithoutPopup?: boolean
    noSwitchNetworkTip?: boolean
    hiddenConnectButton?: boolean
    children?: React.ReactNode
    expectedChainIdSwitchedCallback?: () => Promise<void>
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
}

export function ChainBoundary<T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    const {
        noSwitchNetworkTip = true,
        expectedPluginID,
        expectedChainId,
        expectedChainIdSwitchedCallback,
        switchChainWithoutPopup = false,
        predicate = (actualPluginID, actualChainId) =>
            actualPluginID === expectedPluginID && actualChainId === expectedChainId,
    } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const actualPluginID = useCurrentWeb3NetworkPluginID()
    const plugin = useActivatedPlugin(actualPluginID, 'any')

    const { Others: actualOthers } = useWeb3State(actualPluginID)
    const actualChainId = useChainId(actualPluginID)
    const actualProviderType = useProviderType(actualPluginID)
    const actualProviderDescriptor = useProviderDescriptor(actualPluginID)
    const actualChainName = actualOthers?.chainResolver.chainName(actualChainId)
    const account = useAccount(actualPluginID)

    const { Others: expectedOthers } = useWeb3State(expectedPluginID)
    const expectedConnection = useWeb3Connection(expectedPluginID)
    const expectedAllowTestnet = useAllowTestnet(expectedPluginID)

    const chainIdValid = useChainIdValid(actualPluginID)

    const expectedChainName = expectedOthers?.chainResolver.chainName(expectedChainId)
    const expectedNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, expectedChainId)
    const expectedChainAllowed = expectedOthers?.chainResolver.isValid(expectedChainId, expectedAllowTestnet)

    const isPluginIDMatched = actualPluginID === expectedPluginID
    const isMatched = predicate(actualPluginID, actualChainId)

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const onSwitchChain = useCallback(async () => {
        // a short time loading makes the user fells better
        await delay(1000)

        if (!expectedChainAllowed) return 'init'

        if (!isPluginIDMatched || actualProviderType === ProviderType.WalletConnect) {
            openSelectProviderDialog()
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

            await expectedChainIdSwitchedCallback?.()
        }
        return
    }, [
        expectedChainAllowed,
        isMatched,
        isPluginIDMatched,
        actualProviderType,
        expectedChainId,
        expectedConnection,
        openSelectProviderDialog,
    ])

    const switchButtonDisabled = useMemo(() => {
        return !(actualProviderDescriptor.enableRequirements?.supportedChainIds?.includes(expectedChainId) ?? false)
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

    if (!chainIdValid && !expectedChainAllowed)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        fullWidth
                        startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                        onClick={openSelectProviderDialog}
                        {...props.ActionButtonPromiseProps}>
                        {t('plugin_wallet_wrong_network')}
                    </ActionButton>
                ) : null}
            </>,
        )

    if (!account)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        fullWidth
                        startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                        onClick={openSelectProviderDialog}
                        {...props.ActionButtonPromiseProps}>
                        {t('plugin_wallet_connect_wallet')}
                    </ActionButton>
                ) : null}
            </>,
        )

    if (isMatched) return <>{props.children}</>

    if (actualPluginID !== expectedPluginID) {
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
                {expectedChainAllowed ? (
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
                                {t('plugin_wallet_connect_network', {
                                    network: expectedChainName,
                                })}
                            </span>
                        }
                        waiting={t('plugin_wallet_connect_network_under_going', {
                            network: expectedChainName,
                        })}
                        complete={t('plugin_wallet_connect_network', {
                            network: expectedChainName,
                        })}
                        failed={t('retry')}
                        executor={onSwitchChain}
                        completeOnClick={onSwitchChain}
                        failedOnClick="use executor"
                        {...props.ActionButtonPromiseProps}
                    />
                ) : null}
            </>,
            actualProviderType === ProviderType.WalletConnect ? t('plugin_wallet_connect_tips') : '',
        )
    }

    return renderBox(
        <>
            {!noSwitchNetworkTip ? (
                <Typography color={MaskColorVar.errorPlugin}>
                    <span>
                        {t('plugin_wallet_not_available_on', {
                            network: actualChainName,
                        })}
                    </span>
                </Typography>
            ) : null}
            {expectedChainAllowed ? (
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
                    init={<span>{t('plugin_wallet_switch_network', { network: expectedChainName })}</span>}
                    waiting={t('plugin_wallet_switch_network_under_going', {
                        network: expectedChainName,
                    })}
                    complete={t('plugin_wallet_switch_network', { network: expectedChainName })}
                    failed={t('retry')}
                    executor={onSwitchChain}
                    completeOnClick={onSwitchChain}
                    failedOnClick="use executor"
                    {...props.ActionButtonPromiseProps}
                />
            ) : null}
        </>,
        actualProviderType === ProviderType.WalletConnect
            ? t('plugin_wallet_connect_tips')
            : switchButtonDisabled
            ? t('plugin_wallet_not_support_network')
            : '',
    )
}
