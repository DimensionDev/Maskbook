import { useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { DialogActions, DialogContent, CircularProgress, Tab, Typography } from '@mui/material'
import { isDashboardPage, EMPTY_LIST } from '@masknet/shared-base'
import { MaskTabList, useTabs } from '@masknet/theme'
import { ChainId, networkResolver, NetworkType } from '@masknet/web3-shared-evm'
import { useI18N, PluginWalletStatusBar } from '../../../utils'
import { InjectedDialog } from '@masknet/shared'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { SavingsProtocol, TabType } from '../types'
import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsFormDialog } from './SavingsForm'
import { flatten } from 'lodash-unified'
import { useChainId, useWeb3, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { SavingsProtocols, LazyProtocolsResolvers } from '../protocols'
import { TabContext, TabPanel } from '@mui/lab'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

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
        return networks.map((network: NetworkType) => networkResolver.networkChainId(network))
    }, [])

    const { loading: lazyLoading, value: lazyProtocols } = useAsync(async () => {
        const currentChainLazyResolvers = LazyProtocolsResolvers.filter((_) => _.supportChains.includes(chainId))
        try {
            const allResults = await Promise.all(
                currentChainLazyResolvers.map((resolver) =>
                    resolver.resolve(chainId, web3, connection as Web3Helper.Web3ConnectionScope),
                ),
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

    const [currentTab, onChange, tabs] = useTabs('Deposit', 'Withdraw')

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <TabContext value={currentTab}>
                    <InjectedDialog
                        open={open}
                        title={t('plugin_savings')}
                        onClose={() => {
                            onClose?.()
                            setSelectedProtocol(null)
                        }}
                        titleTabs={
                            <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                                <Tab label={<Typography>{tabs.Deposit}</Typography>} value={tabs.Deposit} />
                                <Tab label={<Typography>{tabs.Withdraw}</Typography>} value={tabs.Withdraw} />
                            </MaskTabList>
                        }>
                        <DialogContent style={{ padding: 0, overflowX: 'hidden' }}>
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
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.Deposit}>
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
                                    </TabPanel>
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.Withdraw}>
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
                                    </TabPanel>
                                </div>
                            </>
                        </DialogContent>

                        <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                            <PluginWalletStatusBar>
                                <ChainBoundary
                                    expectedChainId={chainId}
                                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                />
                            </PluginWalletStatusBar>
                        </DialogActions>
                    </InjectedDialog>
                </TabContext>
                {selectedProtocol ? (
                    <SavingsFormDialog
                        tab={tab}
                        chainId={chainId}
                        protocol={selectedProtocol}
                        onClose={() => setSelectedProtocol(null)}
                    />
                ) : null}
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
