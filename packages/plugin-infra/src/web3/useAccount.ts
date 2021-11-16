import { first } from 'lodash-es'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the address of the default wallet
 */
export function useAccount(pluginID?: string) {
    const { account, wallets } = usePluginWeb3StateContext(pluginID)

    console.log({
        account,
        wallets,
    })

    return process.env.architecture === 'app' ? first(wallets)?.address ?? '' : account
}
