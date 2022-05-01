import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import '../messages'
import { setupDatabase } from './database'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
    },
}
export default worker
