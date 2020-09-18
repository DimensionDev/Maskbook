import * as WalletConnect from './providers/WalletConnect'
import * as MetaMask from './providers/MetaMask'
import { getManagedWallets, setDefaultWallet } from '../../../plugins/Wallet/wallet'
import { openOptionsPage } from '../WelcomeService'
import { DashboardRoute } from '../../options-page/Route'

//#region connect WalletConnect
// step 1:
// Generate the connection URI and render a QRCode for scanning by the user
export async function createConnectionURI() {
    return (await WalletConnect.createConnector()).uri
}

// step2:
// If user confirmed the request we will receive the 'connect' event
export async function connectWalletConnect() {
    const connector = await WalletConnect.createConnector()
    if (connector.connected) return connector.accounts[0]
    return WalletConnect.requestAccounts()
}
//#endregion

export async function connectMetaMask() {
    return MetaMask.requestAccounts()
}

export async function connectMaskbook() {
    const { wallets } = await getManagedWallets()
    // no wallet exists go to wallet panel in the dashboard
    if (wallets.length === 0) {
        openOptionsPage(DashboardRoute.Wallets, 'error=nowallet')
        return
    }
    // return the default wallet
    const defaultWallet = wallets.find((x) => x._wallet_is_default)
    if (defaultWallet) return defaultWallet.address
    // set first managed wallet as the default wallet
    await setDefaultWallet(wallets[0].address)
    return wallets[0].address
}
