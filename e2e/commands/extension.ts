import { join } from 'path'
import { rmdirSync, existsSync, readdirSync, lstatSync, unlinkSync } from 'fs'

function deleteFolderRecursive(dirPath: string) {
    if (!existsSync(dirPath)) {
        return
    }
    readdirSync(dirPath).forEach(file => {
        const curPath = dirPath + '/' + file
        if (lstatSync(curPath).isDirectory()) {
            deleteFolderRecursive(curPath)
        } else {
            unlinkSync(curPath)
        }
    })
    rmdirSync(dirPath)
}

export function removeDB(id: string = process.env.E2E_EXT_ID!) {
    const dbDirPath = join(
        process.env.E2E_USER_DATA_DIR!,
        `./Default/IndexedDB/chrome-extension_${id}_0.indexeddb.leveldb`,
    )
    if (existsSync(dbDirPath)) {
        deleteFolderRecursive(dbDirPath)
    }
}

export function removeSettings(id: string = process.env.E2E_EXT_ID!) {
    const settingsDirPath = join(process.env.E2E_USER_DATA_DIR!, `./Default/Local Extension Settings/${id}`)
    if (existsSync(settingsDirPath)) {
        deleteFolderRecursive(settingsDirPath)
    }
}
