import fs from 'fs/promises'
import { resolve } from 'path'
import { PKG_PATH } from '.'
import { prettier } from './prettier'

export async function* walk(
    dir: string,
    test: RegExp | ((path: string, isFolder: boolean) => boolean),
): AsyncIterableIterator<string> {
    for await (const dirent of await fs.opendir(dir)) {
        const entry = resolve(dir, dirent.name)
        if (dirent.isDirectory()) {
            if (typeof test === 'function' && !test(entry, true)) continue

            yield* walk(entry, test)
        } else if (dirent.isFile()) {
            if (typeof test === 'function') {
                if (test(entry, false)) yield entry
            } else if (test.test(entry)) yield entry
        }
    }
}
export async function* visitAllTSFiles(under: string = PKG_PATH) {
    const ts = /\.tsx?$/
    const shouldVisit = (path: string, folder: boolean) => (folder ? !path.includes('node_modules') : ts.test(path))

    for await (const file of walk(under, shouldVisit)) {
        yield new File(file)
    }
}
class File {
    constructor(public path: string) {}
    get content() {
        return fs.readFile(this.path, 'utf-8')
    }
    async setContent(f: string) {
        return fs.writeFile(this.path, await prettier(f), 'utf-8')
    }
}
