import { WalletStartUp } from './components/StartUp'
import { useWallets } from '@masknet/web3-shared'
import { Route, Switch } from 'react-router-dom'
import { DialogRoutes } from '../../index'
import { ImportWallet } from './components/ImportWallet'
import { useHistory } from 'react-router'
import { useEffect } from 'react'

export default function Wallet() {
    const history = useHistory()
    const wallets = useWallets()

    useEffect(() => {
        if (wallets.length) history.push(DialogRoutes.ImportWallet)
    }, [wallets])

    //TODO: replace to sign state
    return wallets.length === 0 ? (
        <WalletStartUp />
    ) : (
        <Switch>
            <Route path={DialogRoutes.ImportWallet} children={<ImportWallet />} />
        </Switch>
    )
}
