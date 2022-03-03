import { useState } from 'react'
import { useAsync } from 'react-use'
import { Typography, DialogContent } from '@mui/material'
import { isDashboardPage } from '@masknet/shared-base'
import { ChainId, getChainIdFromNetworkType, useChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { EMPTY_LIST } from '../../../../utils-pure'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '../../Trader/trader/useTargetChainIdContext'
import { FolderTabPanel, FolderTabs } from '@masknet/theme'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { ProtocolType, SavingsProtocol, TabType } from '../types'

import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsForm } from './SavingsForm'

export interface SavingsDialogProps {
    open: boolean
    protocols: SavingsProtocol[]
    onClose?: () => void
    onSwapDialogOpen?: () => void
}

export function SavingsDialog({ open, protocols, onClose, onSwapDialogOpen }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType | null>(null)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open
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

                        {selectedProtocol === null ? (
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
                                        <Typography variant="h5" textAlign="center">
                                            {t('plugin_no_protocol_available')}
                                        </Typography>
                                    ) : (
                                        <FolderTabs>
                                            <FolderTabPanel label="DEPOSIT">
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Deposit}
                                                    protocols={protocols}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                    setTab={setTab}
                                                />
                                            </FolderTabPanel>
                                            <FolderTabPanel label="WITHDRAW">
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Withdraw}
                                                    protocols={protocols}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                    setTab={setTab}
                                                />
                                            </FolderTabPanel>
                                        </FolderTabs>
                                    )}
                                </div>
                            </>
                        ) : (
                            <SavingsForm
                                tab={tab}
                                chainId={chainId}
                                selectedProtocol={selectedProtocol}
                                onClose={onClose}
                                onSwapDialogOpen={onSwapDialogOpen}
                            />
                        )}
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
