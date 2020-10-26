import type { LotteryRecordInDatabase } from './types'
import type { _UnboxPromise } from 'async-call-rpc/full'
import { LotteryPluginID } from './constants'
import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'

export const LotteryDatabase = createPluginDatabase<LotteryRecordInDatabase>(LotteryPluginID)
