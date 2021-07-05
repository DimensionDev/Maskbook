import { useCallback } from 'react'
import { Box, Typography } from '@material-ui/core'
import {
    ChainId,
    getChainDetailed,
    getChainDetailedCAIP,
    getChainName,
    ProviderType,
    resolveProviderName,
    useAccount,
    useAllowTestnet,
    useChainDetailed,
    useChainId,
} from '@masknet/web3-shared'
import { useValueRef, delay } from '@masknet/shared'
import { ActionButtonPromise } from '../../extension/options-page/DashboardComponents/ActionButton'
import { currentChainIdSettings, currentProviderSettings } from '../../plugins/Wallet/settings'
import Services from '../../extension/service'
import { useI18N } from '../../utils'

export interface EthereumChainBoundaryProps {
    chainId: ChainId
    children?: React.ReactNode
}

export function EthereumChainBoundary(props: EthereumChainBoundaryProps) {
    const { t } = useI18N()
    const account = useAccount()
    const chainId = useChainId()
    const chainDetailed = useChainDetailed()
    const allowTestnet = useAllowTestnet()
    const providerType = useValueRef(currentProviderSettings)

    const expectedChainId = props.chainId
    const expectedNetwork = getChainName(expectedChainId)
    const acutalChainId = chainId
    const actualNetwork = getChainName(acutalChainId)

    // if false then the user should switch network manually
    const isSwitchable = providerType === ProviderType.Maskbook || getChainDetailed(expectedChainId)?.chain !== 'ETH'

    // if testnets were not allowed it will not guide the user to switch the network
    const isAllowed = allowTestnet || chainDetailed?.network === 'mainnet'

    const onSwitch = useCallback(async () => {
        // a short time loading makes the user fells better
        await delay(1000)

        if (!isAllowed) return
        if (!isSwitchable) return

        // read the chain detailed from the built-in chain list
        const chainDetailedCAIP = getChainDetailedCAIP(expectedChainId)
        if (!chainDetailedCAIP) throw new Error('Unknown network type.')

        // if mask wallet was used it can switch network automatically
        if (providerType === ProviderType.Maskbook) {
            currentChainIdSettings.value = expectedChainId
            return
        }

        // request ethereum-compatiable network
        await Services.Ethereum.addEthereumChain(chainDetailedCAIP, account)
    }, [account, isAllowed, isSwitchable, providerType, expectedChainId])

    if (acutalChainId === expectedChainId) return <>{props.children}</>

    if (!isAllowed)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingTop: 1, paddingBottom: 1 }}>
                <Typography color="textPrimary">
                    <span>
                        {t('plugin_wallet_not_availabe_on', {
                            network: actualNetwork,
                        })}
                    </span>
                </Typography>
            </Box>
        )

    return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingTop: 1, paddingBottom: 1 }}>
            <Typography color="textPrimary">
                <span>
                    {t('plugin_wallet_not_availabe_on', {
                        network: actualNetwork,
                    })}
                </span>
                {isSwitchable ? null : (
                    <span>
                        {t('plugin_wallet_swtich_to', {
                            network: expectedNetwork,
                            provider: resolveProviderName(providerType),
                        })}
                    </span>
                )}
            </Typography>
            {isSwitchable ? (
                <ActionButtonPromise
                    variant="contained"
                    size="small"
                    sx={{ marginTop: 1.5 }}
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
