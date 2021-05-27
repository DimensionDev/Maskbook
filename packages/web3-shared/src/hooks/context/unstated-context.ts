import { createContainer } from 'unstated-next'
import { useSharedStatesRaw } from './shared-states'

/** @internal */
export const Web3Context = createContainer(useSharedStatesRaw)
export const useWeb3Context = Web3Context.useContainer
