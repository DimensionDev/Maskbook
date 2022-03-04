import { useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { Typography, DialogContent } from '@mui/material'
import { ChainId, getChainIdFromNetworkType, useChainId } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { EMPTY_LIST } from '../../../../utils-pure'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '../../Trader/trader/useTargetChainIdContext'
import { FolderTabPanel, FolderTabs } from '@masknet/theme'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { TabType } from '../types'
import { SavingsProtocols } from '../protocols'

import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsForm } from './SavingsForm'

interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    // const mappableProtocols = useMemo(() => {
    //     return Object.keys(ProtocolCategory)
    //         .map((category) => ({
    //             category,
    //             protocols: SavingsProtocols.filter(
    //                 (protocol) => protocol.category.toLowerCase() === category.toLowerCase(),
    //             ),
    //         }))
    //         .filter((categorizedProtocol) =>
    //             categorizedProtocol.protocols.some(({ availableNetworks }) =>
    //                 availableNetworks.some((network) => network.chainId === chainId),
    //             ),
    //         )
    // }, [chainId])

    const protocols = useMemo(() => SavingsProtocols.filter((x) => x.bareToken.chainId === chainId), [chainId])

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

                        {selectedProtocol ? (
                            <SavingsForm
                                tab={tab}
                                chainId={chainId}
                                protocols={selectedProtocol}
                                onClose={onClose}
                                onSwapDialogOpen={onSwapDialogOpen}
                            />
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
                                                    setSelectedProtocol={setSelectedProtocol}
                                                    setTab={setTab}
                                                />
                                            </FolderTabPanel>
                                            <FolderTabPanel label="Withdraw">
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
                        )}
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
