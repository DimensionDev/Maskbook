import { first } from 'lodash-unified'
import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the address of the default wallet
 */
export function useAccount(pluginID?: NetworkPluginID) {
    const { account, wallets } = usePluginWeb3StateContext(pluginID)
    return process.env.architecture === 'app' ? first(wallets)?.address ?? '' : account
}
