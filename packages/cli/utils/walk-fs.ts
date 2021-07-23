import fs from 'fs/promises'
import { resolve } from 'path'
export async function* walk(dir: string): AsyncIterableIterator<string> {
    for await (const dirent of await fs.opendir(dir)) {
        const entry = resolve(dir, dirent.name)
        if (dirent.isDirectory()) {
            yield* walk(entry)
        } else if (dirent.isFile() && /\.(tsx?)$/.test(entry)) {
            yield entry
        }
    }
}
