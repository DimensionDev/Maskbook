import React, { useCallback, useMemo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
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

export interface ChainBoundaryProps<T extends NetworkPluginID> extends withClasses<'switchButton'> {
    /** The expected network plugin ID */
    expectedPluginID: T
    /** The expected sub-network under the network plugin */
    expectedChainId: Web3Helper.Definition[T]['ChainId']
    /** Judge the network is available for children components */
    predicate?: (actualPluginID: NetworkPluginID, actualChainId: Web3Helper.Definition[T]['ChainId']) => boolean

    className?: string
    noSwitchNetworkTip?: boolean
    hiddenConnectButton?: boolean
    children?: React.ReactNode
    renderInTimeline?: boolean
    ActionButtonPromiseProps?: Partial<ActionButtonPromiseProps>
}

export function ChainBoundary<T extends NetworkPluginID>(props: ChainBoundaryProps<T>) {
    const {
        noSwitchNetworkTip = true,
        expectedPluginID,
        expectedChainId,
        predicate = (actualPluginID, actualChainId) =>
            actualPluginID === expectedPluginID && actualChainId === expectedChainId,
    } = props

    const { t } = useI18N()
    const theme = useTheme()
    const classes = useStylesExtends(useStyles(), props)

    const actualPluginID = useCurrentWeb3NetworkPluginID()
    const { Others: actualOthers } = useWeb3State<'all'>(actualPluginID)
    const actualChainId = useChainId(actualPluginID)
    const actualProviderType = useProviderType(actualPluginID)
    const actualChainName = actualOthers?.chainResolver.chainName(actualChainId)

    const { Others: expectedOthers } = useWeb3State<'all'>(expectedPluginID)
    const expectedConnection = useWeb3Connection<'all'>(expectedPluginID)
    const expectedAllowTestnet = useAllowTestnet(expectedPluginID)
    const expectedAccount = useAccount(expectedPluginID)
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

        if (!expectedChainAllowed) return

        if (!isPluginIDMatched || actualProviderType === ProviderType.WalletConnect) {
            openSelectProviderDialog()
            return
        }
        if (!isMatched) {
            await expectedConnection?.connect({
                chainId: expectedChainId,
            })
        }
    }, [
        expectedChainAllowed,
        isMatched,
        isPluginIDMatched,
        actualProviderType,
        expectedChainId,
        expectedConnection,
        openSelectProviderDialog,
    ])

    // TODO: will remove this and extract new boundary for timeline
    const buttonProps = useMemo(() => {
        return {
            ...(props.renderInTimeline
                ? {
                      variant: 'contained',
                      fullWidth: true,
                      sx: {
                          backgroundColor: theme.palette.maskColor.dark,
                          color: theme.palette.maskColor.white,
                          '&:hover': {
                              backgroundColor: theme.palette.maskColor.dark,
                          },
                      },
                  }
                : {}),
            ...props.ActionButtonPromiseProps,
        } as Partial<ActionButtonPromiseProps>
    }, [props.ActionButtonPromiseProps, props.renderInTimeline])

    const renderBox = (children?: React.ReactNode, tips?: string) => {
        return (
            <ShadowRootTooltip title={tips ?? ''} classes={{ tooltip: classes.tooltip }} arrow placement="top">
                <Box
                    className={props.className}
                    sx={{ flex: 1 }}
                    display="flex"
                    flexDirection="column"
                    alignItems="center">
                    {children}
                </Box>
            </ShadowRootTooltip>
        )
    }

    if (!expectedAccount)
        return renderBox(
            <>
                {!props.hiddenConnectButton ? (
                    <ActionButton
                        fullWidth
                        startIcon={<PluginWalletConnectIcon />}
                        variant="contained"
                        size={props.ActionButtonPromiseProps?.size}
                        sx={{ marginTop: 1.5 }}
                        onClick={openSelectProviderDialog}
                        {...buttonProps}>
                        {t('plugin_wallet_connect_wallet')}
                    </ActionButton>
                ) : null}
            </>,
        )

    if (isMatched) return <>{props.children}</>

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
                    startIcon={
                        <WalletIcon
                            networkIcon={expectedNetworkDescriptor?.icon} // switch the icon to meet design
                            isBorderColorNotDefault
                            size={18}
                        />
                    }
                    sx={props.ActionButtonPromiseProps?.sx}
                    style={{ borderRadius: 10, paddingTop: 11, paddingBottom: 11 }}
                    init={<span>{t('plugin_wallet_switch_network', { network: expectedChainName })}</span>}
                    waiting={t('plugin_wallet_switch_network_under_going', {
                        network: expectedChainName,
                    })}
                    complete={t('plugin_wallet_switch_network', { network: expectedChainName })}
                    failed={t('retry')}
                    executor={onSwitchChain}
                    completeOnClick={onSwitchChain}
                    failedOnClick="use executor"
                    {...buttonProps}
                />
            ) : null}
        </>,
        actualProviderType === ProviderType.WalletConnect ? t('plugin_wallet_connect_tips') : '',
    )
}
