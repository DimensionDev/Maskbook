import { connect, getNetwork } from '@wagmi/core'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { handlePromise } from '../utils.js'

export function __wagmi__execute(providerType: string, id: number, methodName: string, args: unknown[]) {
    console.log('DEBUG: wagmi execute')
    console.log({
        providerType,
        methodName,
        id,
        args,
    })

    const getConnector = () => {
        switch (providerType) {
            case 'MetaMask':
                return new MetaMaskConnector()
            default:
                throw new Error('To be implemented - getConnector.')
        }
    }

    handlePromise(id, () => {
        switch (methodName) {
            case 'connect':
                return connect({
                    connector: getConnector(),
                })
            case 'getNetwork':
                return getNetwork()
            default:
                throw new Error(`Unknown method name: ${methodName}.`)
        }
    })
}
