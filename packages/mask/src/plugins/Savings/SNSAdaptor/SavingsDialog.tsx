import { useState } from 'react'
import { useAsync } from 'react-use'
import { DialogContent } from '@mui/material'
import { ChainId, getChainIdFromNetworkType, useChainId } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { ProtocolType, TabType } from '../types'
import { useStyles } from './SavingsDialogStyles'
import { SavingsTab } from './SavingsTab'
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

    return (
        <InjectedDialog
            open={open || false}
            onClose={() => {
                if (!selectedProtocol) {
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
                        <div className={classes.abstractTabWrapper}>
                            <SavingsTab tab={tab} setTab={setTab} />
                        </div>
                        <div className={classes.abstractTabWrapper}>
                            <SavingsTable chainId={chainId} tab={tab} setSelectedProtocol={setSelectedProtocol} />
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
