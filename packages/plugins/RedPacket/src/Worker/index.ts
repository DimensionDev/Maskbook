import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { setupDatabase } from './database.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        context.startService(import('./services.js'))
        setupDatabase(context.getDatabaseStorage())
    },
}
export default worker
