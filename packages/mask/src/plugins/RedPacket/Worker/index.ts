import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import '../messages.js'
import { setupDatabase } from './database.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
    },
}
export default worker
