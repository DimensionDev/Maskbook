import { makeStyles } from '@masknet/theme'
import { TransactionStatusType, useWallet, useWeb3StateContext } from '@masknet/web3-shared'
import { Typography } from '@material-ui/core'
import { useCallback } from 'react'
import { useRecentTransactions } from '../../../../plugins/Wallet/hooks/useRecentTransactions'
import Services from '../../../service'
import { WalletStateBarUI } from '../../components/WalletStateBar'
import { SwapBox } from './SwapBox'

const useStyles = makeStyles()((theme) => {
    return {
        walletStateBar: {
            color: theme.palette.grey['900'],
        },
        page: {
            minHeight: '100vh',
            maxWidth: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F7F9FA',
        },
        container: {
            width: 800,
            backgroundColor: theme.palette.background.paper,
            marginLeft: 'auto',
            marginRight: 'auto',
            height: 720,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 16,
        },
        header: {
            width: 520,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
        },
        main: {
            width: 520,
        },
    }
})

export default function SwapPage() {
    const { classes } = useStyles()
    const { providerType } = useWeb3StateContext()
    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)
    const wallet = useWallet()
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupsWindow('/wallets/select')
    }, [])
    return (
        <div className={classes.page}>
            <div className={classes.container}>
                <header className={classes.header}>
                    <WalletStateBarUI
                        className={classes.walletStateBar}
                        isPending={pendingTransactions.length > 0}
                        providerType={providerType}
                        openConnectWalletDialog={openPopupsWindow}
                        walletName={wallet?.name ?? '-'}
                        walletAddress={wallet?.address ?? '-'}
                    />
                </header>
                <main className={classes.main}>
                    <Typography variant="h1" className={classes.title}>
                        Swap
                    </Typography>
                    <SwapBox />
                </main>
            </div>
        </div>
    )
}
