import { Button } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useWallets } from './api'
import { StartUp } from './StartUp'
import { CreateWallet } from './CreateWallet'

export default function Wallets() {
    const wallets = useWallets()
    return (
        <PageFrame title="Wallets" primaryAction={<Button>Create a new wallet</Button>}>
            {wallets.length === 0 ? <StartUp /> : <CreateWallet />}
        </PageFrame>
    )
}
