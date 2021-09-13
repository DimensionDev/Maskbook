import fs from 'fs/promises'
import { resolve } from 'path'

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
