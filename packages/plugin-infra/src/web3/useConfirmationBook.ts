import type { NetworkPluginID } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useConfirmationBook(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).confirmationBook
}
