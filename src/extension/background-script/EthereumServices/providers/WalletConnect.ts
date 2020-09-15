import { EthereumAddress } from 'wallet.ts'
import WalletConnect from '@walletconnect/client'
import { remove } from 'lodash-es'
import { updateExoticWalletsFromSource } from '../../../../plugins/Wallet/wallet'
import { currentWalletConnectChainIdSettings } from '../../../../settings/settings'
import { ChainId } from '../../../../web3/types'
import { ProviderType } from '../../../../plugins/Wallet/types'

//#region tracking chain id
let currentChainId: ChainId = ChainId.Mainnet
currentWalletConnectChainIdSettings.addListener((v) => (currentChainId = v))
//#endregion

let connector: WalletConnect | null = null

export async function createConnector() {
    if (!connector) {
        connector = new WalletConnect({
            bridge: 'https://bridge.walletconnect.org',
        })
        connector.on('session_update', onUpdate)
        connector.on('disconnect', onDisconnect)
    }
    if (!connector.connected) await connector.createSession()
    return connector
}

export async function requestAccounts(timeout: number = 3 * 60) {
    const connector = await createConnector()
    if (connector.accounts.length) return connector.accounts[0]
    return new Promise(async (resolve, reject) => {
        const onConnect = async () => {
            clearTimeout(timeoutTimer)
            mimicEventRemover(connector, [onConnect])
            await updateWalletInDB(connector.accounts[0], false)
            resolve(connector.accounts[0])
        }
        const timeoutTimer = setTimeout(() => {
            mimicEventRemover(connector, [onConnect])
            reject(new Error('timeout'))
        }, timeout)
        connector.on('connect', onConnect)
        connector.on('session_update', onConnect)
        connector.on('error', (err) => {
            clearTimeout(timeoutTimer)
            mimicEventRemover(connector, [onConnect])
            reject(err)
        })
    })
}

const onUpdate = () => {
    return async (
        err: Error | null,
        payload: {
            params: {
                chainId: number
                accounts: string[]
            }[]
        },
    ) => {
        if (err) return
        const { chainId, accounts } = payload.params[0]

        // update chain id settings
        currentWalletConnectChainIdSettings.value = chainId

        // update wallet in the DB
        await updateWalletInDB(accounts[0], false)
    }
}
const onDisconnect = (err: Error | null) => {
    if (connector) mimicEventRemover(connector)
    connector = null
}

function mimicEventRemover(connector: WalletConnect, callbacks: Function[] = [onUpdate, onDisconnect]) {
    try {
        // FIXME:
        // there is no event remover API
        remove((connector as any)._eventManager._eventEmitters, (r: any) => callbacks.includes(r.callback))
    } catch (e) {
        console.log(e)
    }
}

async function updateWalletInDB(address: string, setAsDefault: boolean = false) {
    // validate address
    if (!!EthereumAddress.isValid(address)) throw new Error('Cannot found account or invalid account')

    // update wallet in the DB
    await updateExoticWalletsFromSource(
        ProviderType.WalletConnect,
        new Map([[address, { address, _wallet_is_default: setAsDefault }]]),
    )
}
