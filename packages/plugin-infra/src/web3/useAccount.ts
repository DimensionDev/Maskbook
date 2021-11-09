import { first } from 'lodash-es'
import { usePluginWeb3StateContext } from '../context'

/**
 * Get the address of the default wallet
 */
export function useAccount(pluginID?: string) {
    const { account, wallets } = usePluginWeb3StateContext(pluginID)
    return process.env.architecture === 'app' ? first(wallets)?.address ?? '' : account
}
