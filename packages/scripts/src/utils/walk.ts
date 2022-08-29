import fs from 'fs/promises'
import { fileURLToPath } from 'url'

export async function* walk(
    dir: URL,
    test: RegExp | ((path: URL, isFolder: boolean) => boolean),
): AsyncIterableIterator<URL> {
    for await (const dirent of await fs.opendir(dir)) {
        const entry = new URL(dirent.name, dir)
        if (dirent.isDirectory()) {
            if (typeof test === 'function' && !test(entry, true)) continue

            yield* walk(entry, test)
        } else if (dirent.isFile()) {
            if (typeof test === 'function') {
                if (test(entry, false)) yield entry
            } else if (test.test(fileURLToPath(entry))) yield entry
        }
    }
}
