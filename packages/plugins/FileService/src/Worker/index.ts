import type { Plugin } from '@masknet/plugin-infra'
import { None, Result, Some } from 'ts-results-es'
import { base } from '../base.js'
import type { FileInfo } from '../types.js'
import { getAllFiles, setFileInfo, setupDatabase } from './database.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        const mod = import('./service.js')
        context.startService(mod.then(({ upload, ...rest }) => rest))
        context.startGeneratorService(mod.then(({ upload }) => ({ upload })))
        setupDatabase(context.getDatabaseStorage())
    },
    backup: {
        onBackup: async () => {
            const files = await getAllFiles()
            const result = files?.length ? new Some(files) : None

            return result
        },
        onRestore: async (files: FileInfo[]) => {
            return Result.wrap(() => {
                files.map(async (file) => {
                    await setFileInfo(file)
                })
            })
        },
    },
}

export default worker
