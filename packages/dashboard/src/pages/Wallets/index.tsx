import { Button } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useWallets } from '@dimensiondev/web3-shared'
import { StartUp } from './StartUp'
import { Market } from './Market'
import { WalletContext } from './hooks/useWalletContext'

function Wallets() {
    const wallets = useWallets()
    return (
        <PageFrame
            title={wallets.length === 0 ? 'Create a Wallet' : 'Market'}
            primaryAction={<Button>Connect Wallet</Button>}>
            {wallets.length === 0 ? <StartUp /> : <Market />}
        </PageFrame>
    )
}

export default function () {
    return (
        <WalletContext.Provider>
            <Wallets />
        </WalletContext.Provider>
    )
}
