import { useState } from 'react'
import { useAsync } from 'react-use'
import { DialogContent } from '@mui/material'
import { ChainId, getChainIdFromNetworkType, useChainId } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { FolderTabPanel, FolderTabs } from '@masknet/theme'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { ProtocolCategory, ProtocolType, TabType } from '../types'
import { SavingsProtocols } from '../protocols'
import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsForm } from './SavingsForm'

interface SavingsDialogProps {
    open?: boolean
    onClose?: () => void
    onSwapDialogOpen?: () => void
}

export function SavingsDialog({ open, onClose, onSwapDialogOpen }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType | null>(null)

    const { value: chains } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    const CategorizedProtocols = Object.keys(ProtocolCategory).map((category) => ({
        category,
        protocols: SavingsProtocols.filter((protocol) => protocol.category.toLowerCase() === category.toLowerCase()),
    }))

    const MappableProtocols = CategorizedProtocols.filter((categorizedProtocol) =>
        categorizedProtocol.protocols.some(({ availableNetworks }) =>
            availableNetworks.some((network) => network.chainId === chainId),
        ),
    )

    return (
        <InjectedDialog
            open={open || false}
            onClose={() => {
                if (selectedProtocol === null) {
                    onClose?.()
                } else {
                    setSelectedProtocol(null)
                }
            }}
            title={t('plugin_savings')}>
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
                                chains={chains ?? []}
                            />
                        </div>
                        <div className={classes.tableTabWrapper}>
                            <FolderTabs>
                                <FolderTabPanel label="DEPOSIT">
                                    <SavingsTable
                                        chainId={chainId}
                                        tab={TabType.Deposit}
                                        mappableProtocols={MappableProtocols}
                                        setSelectedProtocol={setSelectedProtocol}
                                        setTab={setTab}
                                    />
                                </FolderTabPanel>
                                <FolderTabPanel label="WITHDRAW">
                                    <SavingsTable
                                        chainId={chainId}
                                        tab={TabType.Withdraw}
                                        mappableProtocols={MappableProtocols}
                                        setSelectedProtocol={setSelectedProtocol}
                                        setTab={setTab}
                                    />
                                </FolderTabPanel>
                            </FolderTabs>
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
    )
}
