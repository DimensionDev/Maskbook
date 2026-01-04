import { task } from '../utils/task.ts'
import { readFile, writeFile } from 'node:fs/promises'
import { ROOT_PATH } from '../utils/paths.ts'

const pattern = 'packages/**/locale/*.po'

export async function cleanPo() {
    const { glob } = await import('tinyglobby')
    /* cspell:disable-next-line */
    const filePaths = await glob(pattern, { cwd: ROOT_PATH, onlyFiles: true, ignore: ['**/node_modules/**'] })

    await Promise.all(
        filePaths.map((file) =>
            readFile(file, 'utf8').then((str) => {
                return writeFile(
                    file,
                    str
                        .split('\n')
                        .map((x) => x.replace(/^#.+/u, ''))
                        .filter(Boolean)
                        .join('\n'),
                )
            }),
        ),
    )
}
task(cleanPo, 'clean-po', 'Removes all unused strings in po files.')
