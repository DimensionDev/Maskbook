import { useState, useEffect } from 'react'
import { useAsync } from 'react-use'
import { DialogContent } from '@mui/material'
import { ChainId, getChainIdFromNetworkType, useChainId, useWeb3, useAccount } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { getLidoAPR, getLidoBalance } from './protocols/LDOProtocol'
import { useStyles } from './SavingsDialogStyles'
import { SavingsProtocols } from './protocols'
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
    const [tab, setTab] = useState('deposit' as 'deposit' | 'withdraw')
    const [selectedProtocol, setSelectedProtocol] = useState(-1 as number)

    const web3 = useWeb3(false, chainId)
    const account = useAccount()

    useEffect(() => {
        ;(async () => {
            // Set Lido Balance
            const lidoBalance = await getLidoBalance(5, web3, account) // change to `chainId` before merge
            SavingsProtocols[0].balance = lidoBalance
            // Set Lido APR
            const lidoAPR = await getLidoAPR()
            SavingsProtocols[0].apr = lidoAPR

            console.log('lido balance', lidoBalance)
        })()
    }, [])

    const { value: chains } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    return (
        <InjectedDialog
            open={open || false}
            onClose={() => {
                if (selectedProtocol === -1) {
                    onClose?.()
                } else {
                    setSelectedProtocol(-1)
                }
            }}
            title={t('plugin_savings')}>
            <DialogContent>
                {!isDashboard ? (
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                ) : null}

                {selectedProtocol === -1 ? (
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
