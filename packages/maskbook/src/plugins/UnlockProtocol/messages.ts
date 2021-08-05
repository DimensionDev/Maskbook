import { identifier } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

const UnlockProtocolMessage = createPluginMessage(identifier)
export const PuginUnlockProtocolRPC = createPluginRPC(identifier, () => import('./Services'), UnlockProtocolMessage.rpc)
