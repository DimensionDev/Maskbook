import type { RedPacketRecordInDatabase } from './types'
import type { _UnboxPromise } from 'async-call-rpc/full'
import { RedPacketPluginID } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'

export const RedPacketDatabase = createPluginDatabase<RedPacketRecordInDatabase>(RedPacketPluginID)
