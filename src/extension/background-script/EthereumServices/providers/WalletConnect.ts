import { EthereumAddress } from 'wallet.ts'
import WalletConnect from '@walletconnect/client'
import { updateExoticWalletsFromSource } from '../../../../plugins/Wallet/wallet'
import { WalletProviderType } from '../../../../plugins/shared/findOutProvider'
import type { ExoticWalletRecord } from '../../../../plugins/Wallet/database/types'
import { remove } from 'lodash-es'

let connector: WalletConnect | null = null

export async function createConnector() {
    if (!connector) {
        connector = new WalletConnect({
            bridge: 'https://bridge.walletconnect.org',
        })
        mimicEventRemover(connector)
        connector.on('connect', onConnect)
        connector.on('session_update', onUpdate)
        connector.on('disconnect', onDisconnect)
    }
    if (!connector.connected) await connector.createSession()
    return connector
}

const createOnUpdate = (isConnect: boolean) => {
    return (
        err: Error | null,
        payload: {
            params: {
                chainId: number
                accounts: string[]
            }[]
        },
    ) => {
        if (err) return
        const { accounts } = payload.params[0]
        if (accounts.length === 0) return
        const [address] = accounts

        // validate address
        if (!EthereumAddress.isValid(address)) return

        // update wallet
        const record: Partial<ExoticWalletRecord> = {}
        record.address = address
        if (isConnect) record._wallet_is_default = true
        updateExoticWalletsFromSource(WalletProviderType.wallet_connect, new Map([[address, record]]))
    }
}

const onConnect = createOnUpdate(true)
const onUpdate = createOnUpdate(false)

const onDisconnect = (err: Error | null) => {
    connector = null
}

function mimicEventRemover(connector: WalletConnect) {
    try {
        // FIXME:
        // there is no event remover API
        remove((connector as any)._eventManager._eventEmitters, (r: any) =>
            [onConnect, onUpdate, onDisconnect].includes(r.callback),
        )
    } catch (e) {
        console.log(e)
    }
}
