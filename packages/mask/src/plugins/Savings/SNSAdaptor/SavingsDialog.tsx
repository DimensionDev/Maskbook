import { useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { Typography, DialogContent } from '@mui/material'
import { isDashboardPage, EMPTY_LIST } from '@masknet/shared-base'
import { FolderTabPanel, FolderTabs } from '@masknet/theme'
import { ChainId, getChainIdFromNetworkType, useChainId, useWeb3 } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '../../Trader/trader/useTargetChainIdContext'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { SavingsProtocol, TabType } from '../types'
import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsForm } from './SavingsForm'
import { SavingsProtocols, LazyProtocolsResolvers } from '../protocols'
import { flatten } from 'lodash-unified'

export interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const web3 = useWeb3({ chainId })
    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    const { value: lazyProtocols } = useAsync(async () => {
        const allResults = await Promise.all(LazyProtocolsResolvers.map((resolver) => resolver.resolve(chainId, web3)))
        return flatten(allResults)
    }, [web3, chainId])

    const protocols = useMemo(
        () => [...SavingsProtocols, ...(lazyProtocols ?? [])].filter((x) => x.bareToken.chainId === chainId),
        [chainId, lazyProtocols],
    )

    useUpdateEffect(() => {
        setChainId(currentChainId)
    }, [currentChainId])

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open={open}
                    title={t('plugin_savings')}
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
                                        chains={chains}
                                    />
                                </div>
                                <div className={classes.tableTabWrapper}>
                                    {protocols.length === 0 ? (
                                        <Typography variant="body2" textAlign="center">
                                            {t('plugin_no_protocol_available')}
                                        </Typography>
                                    ) : (
                                        <FolderTabs>
                                            <FolderTabPanel label="Deposit">
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Deposit}
                                                    protocols={protocols}
                                                    setTab={setTab}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                />
                                            </FolderTabPanel>
                                            <FolderTabPanel label="Withdraw">
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Withdraw}
                                                    protocols={protocols.filter((x) => !x.balance.isZero())}
                                                    setTab={setTab}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                />
                                            </FolderTabPanel>
                                        </FolderTabs>
                                    )}
                                </div>
                            </>
                        )}
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
