import { makeStyles } from '@masknet/theme'
import {
    getNetworkName,
    useChainId,
    useChainColor,
    useWeb3StateContext,
    useWallet,
    TransactionStatusType,
} from '@masknet/web3-shared'
import { useRecentTransactions } from '../../../../plugins/Wallet/hooks/useRecentTransactions'
import { WalletStateBarUI } from '../../components/WalletStateBar'
import { SwapBox } from './SwapBox'
import { Typography } from '@material-ui/core'

const useStyles = makeStyles()((theme) => {
    return {
        container: {
            width: 800,
            backgroundColor: theme.palette.background.default,
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
    const chainId = useChainId()
    const chainColor = useChainColor()
    const { providerType } = useWeb3StateContext()
    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)
    const wallet = useWallet()
    return (
        <div className={classes.container}>
            <header className={classes.header}>
                <WalletStateBarUI
                    isPending={pendingTransactions.length > 0}
                    networkName={getNetworkName(chainId) ?? ''}
                    chainColor={chainColor}
                    providerType={providerType}
                    openConnectWalletDialog={() => {}}
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
    )
}
