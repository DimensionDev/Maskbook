import { useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { DialogContent, CircularProgress } from '@mui/material'
import { isDashboardPage, EMPTY_LIST } from '@masknet/shared-base'
import { FolderTabPanel, FolderTabs } from '@masknet/theme'
import { ChainId, networkResolver } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '@masknet/shared'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { SavingsProtocol, TabType } from '../types'
import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsForm } from './SavingsForm'
import { flatten } from 'lodash-unified'
import { useChainId, useWeb3, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { SavingsProtocols, LazyProtocolsResolvers } from '../protocols'

export interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => networkResolver.networkChainId(network))
    }, [])

    const { loading: lazyLoading, value: lazyProtocols } = useAsync(async () => {
        const currentChainLazyResolvers = LazyProtocolsResolvers.filter((_) => _.supportChains.includes(chainId))
        try {
            const allResults = await Promise.all(
                currentChainLazyResolvers.map((resolver) => resolver.resolve(chainId, web3, connection)),
            )
            return flatten(allResults)
        } catch (error) {
            console.error('lazyProtocols: resolve error', error)
        }
        return []
    }, [web3, chainId])

    const protocols = useMemo(() => {
        return [...SavingsProtocols, ...(lazyProtocols ?? [])].filter((x) => x.bareToken.chainId === chainId)
    }, [chainId, lazyProtocols])

    useUpdateEffect(() => {
        setChainId(currentChainId)
    }, [currentChainId])

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open={open}
                    title={t('plugin_savings')}
                    isOnBack={Boolean(selectedProtocol)}
                    onClose={() => {
                        if (selectedProtocol === null) {
                            onClose?.()
                        } else {
                            setSelectedProtocol(null)
                        }
                    }}>
                    <DialogContent>
                        {!isDashboard ? (
                            <div className={classes.walletStatusBox}>
                                <WalletStatusBox />
                            </div>
                        ) : null}

                        {selectedProtocol ? (
                            <SavingsForm tab={tab} chainId={chainId} protocol={selectedProtocol} onClose={onClose} />
                        ) : (
                            <>
                                <div className={classes.abstractTabWrapper}>
                                    <NetworkTab
                                        chainId={chainId}
                                        setChainId={setChainId}
                                        classes={classes}
                                        chains={chains.filter(Boolean) as ChainId[]}
                                    />
                                </div>
                                <div className={classes.tableTabWrapper}>
                                    <FolderTabs>
                                        <FolderTabPanel label="Deposit">
                                            {lazyLoading ? (
                                                <div className={classes.loading}>
                                                    <CircularProgress />
                                                </div>
                                            ) : (
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Deposit}
                                                    protocols={protocols}
                                                    setTab={setTab}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                />
                                            )}
                                        </FolderTabPanel>
                                        <FolderTabPanel label="Withdraw">
                                            {lazyLoading ? (
                                                <div className={classes.loading}>
                                                    <CircularProgress />
                                                </div>
                                            ) : (
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Withdraw}
                                                    protocols={protocols}
                                                    setTab={setTab}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                />
                                            )}
                                        </FolderTabPanel>
                                    </FolderTabs>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
