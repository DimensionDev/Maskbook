import { None, Plugin, Result, Some } from '@masknet/plugin-infra'
import { base } from '../base'
import type { FileInfo } from '../types'
import { getAllFiles, setFileInfo, setupDatabase } from './database'
import './rpc'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
    },
    backup: {
        onBackup: async () => {
            const files = await getAllFiles()
            const result = files?.length ? new Some(files) : None

            return Promise.resolve(result)
        },
        onRestore: async (files: FileInfo[]) => {
            return Promise.resolve(
                Result.wrap(() => {
                    files.map(async (file) => {
                        file.createdAt = new Date(file.createdAt)
                        await setFileInfo(file)
                    })
                }),
            )
        },
    },
}

export default worker
