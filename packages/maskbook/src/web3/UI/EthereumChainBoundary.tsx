import { useCallback } from 'react'
import { Box, Typography, Theme } from '@material-ui/core'
import type { SxProps } from '@material-ui/system'
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
import { useValueRef, delay, useRemoteControlledDialog } from '@masknet/shared'
import ActionButton, { ActionButtonPromise } from '../../extension/options-page/DashboardComponents/ActionButton'
import { currentProviderSettings } from '../../plugins/Wallet/settings'
import Services from '../../extension/service'
import { useI18N } from '../../utils'
import { WalletMessages, WalletRPC } from '../../plugins/Wallet/messages'

export interface EthereumChainBoundaryProps {
    chainId: ChainId
    noSwitchNetworkTip?: boolean
    switchButtonStyle?: SxProps<Theme>
    children?: React.ReactNode
    isValidChainId?: (actualChainId: ChainId, expectedChainId: ChainId) => boolean
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const { t } = useI18N()
    const account = useAccount()
    const chainId = useChainId()
    const allowTestnet = useAllowTestnet()
    const providerType = useValueRef(currentProviderSettings)

    const { noSwitchNetworkTip = false } = props
    const expectedChainId = props.chainId
    const expectedNetwork = expectedChainId === ChainId.BSC ? 'BSC' : getChainName(expectedChainId)
    const actualChainId = chainId
    const actualNetwork = actualChainId === ChainId.BSC ? 'BSC' : getChainName(actualChainId)

    // if false then it will not guide the user to switch the network
    const isAllowed = isChainIdValid(expectedChainId, allowTestnet) && !!account

    const onSwitch = useCallback(async () => {
        // a short time loading makes the user fells better
        await delay(1000)

        if (!isAllowed) return

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
                    ? Services.Ethereum.switchEthereumChain(ChainId.Mainnet, overrides)
                    : Services.Ethereum.addEthereumChain(chainDetailedCAIP, account, overrides),
            ])
        } catch {
            throw new Error(`Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`)
        }
    }, [account, isAllowed, providerType, expectedChainId])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    // is the actual chain id matched with the expected one?
    const isMatched = actualChainId === expectedChainId

    // is the actual chain id a valid one even if it does not match with the expected one?
    const isValid = props?.isValidChainId?.(actualChainId, expectedChainId) ?? false

    if (!account)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingTop: 1, paddingBottom: 1 }}>
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
            </Box>
        )

    if (isMatched || isValid) return <>{props.children}</>

    if (!isAllowed)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingTop: 1, paddingBottom: 1 }}>
                <Typography color="textPrimary">
                    <span>
                        {t('plugin_wallet_not_available_on', {
                            network: actualNetwork,
                        })}
                    </span>
                </Typography>
            </Box>
        )

    return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingTop: 1, paddingBottom: 1 }}>
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
                    sx={props.switchButtonStyle ?? { marginTop: 1.5 }}
                    init={t('plugin_wallet_switch_network', {
                        network: expectedNetwork,
                    })}
                    waiting={t('plugin_wallet_switch_network_under_going', {
                        network: expectedNetwork,
                    })}
                    complete={t('plugin_wallet_switch_network', {
                        network: expectedNetwork,
                    })}
                    failed={t('retry')}
                    executor={onSwitch}
                    completeOnClick={onSwitch}
                    failedOnClick="use executor"
                />
            ) : null}
        </Box>
    )
}
