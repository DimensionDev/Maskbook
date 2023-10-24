import { connect, disconnect, getNetwork } from '@wagmi/core'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { config } from './config.js'
import { handlePromise } from '../utils.js'

config.subscribe((state) => {
    console.log('DEBUG: state')
    console.log(state)
})

const getConnector = (providerType: string) => {
    switch (providerType) {
        case 'MetaMask':
            return new MetaMaskConnector()
        case 'WalletConnect':
            return new WalletConnectConnector({
                options: {
                    projectId: '8f1769933420afe8873860925fcca14f',
                },
            })
        default:
            throw new Error('To be implemented - getConnector.')
    }
}

export function __wagmi__execute(providerType: string, id: number, methodName: string, args: unknown[]) {
    console.log('DEBUG: wagmi execute')
    console.log({
        providerType,
        methodName,
        id,
        args,
    })

    handlePromise(id, async () => {
        try {
            switch (methodName) {
                case 'connect':
                    console.log('DEBUG: connect')
                    console.log(methodName)

                    const connected = await connect({
                        connector: getConnector(providerType),
                    })

                    console.log(connected)

                    return {
                        chainId: connected.chain.id,
                        account: connected.account,
                    }
                case 'disconnect':
                    await disconnect()
                    return
                case 'getNetwork':
                    return getNetwork()
                default:
                    throw new Error(`Unknown method name: ${methodName}.`)
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    })
}
