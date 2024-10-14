import { task } from '../utils/task.js'
import { readFile, writeFile } from 'fs/promises'
import { ROOT_PATH } from '../utils/paths.js'

const pattern = 'packages/**/locale/*.po'
export async function lintPo() {
    const { glob } = await import('glob')
    /* cspell:disable-next-line */
    const filePaths = await glob(pattern, { cwd: ROOT_PATH, nodir: true, ignore: ['**/node_modules/**'] })

    await Promise.all(
        filePaths.map((file) =>
            readFile(file, 'utf8').then((str) => {
                const time = '1970-01-01 00:00+0000'
                const startAt = str.indexOf(': ') === -1 ? str.indexOf(':') : str.indexOf(': ')
                const next = str.slice(0, startAt + 2) + time + str.slice(startAt + 2 + time.length)
                if (str !== next) return writeFile(file, next)
                return
            }),
        ),
    )
}

task(lintPo, 'lint-po', 'Lint all po files.')

export async function cleanPo() {
    const { glob } = await import('glob')
    /* cspell:disable-next-line */
    const filePaths = await glob(pattern, { cwd: ROOT_PATH, nodir: true, ignore: ['**/node_modules/**'] })

    await Promise.all(
        filePaths.map((file) =>
            readFile(file, 'utf8').then((str) => {
                return writeFile(
                    file,
                    str
                        .split('\n')
                        .map((x) => x.replace(/^#.+/, ''))
                        .filter((x) => x)
                        .join('\n'),
                )
            }),
        ),
    )
}
task(cleanPo, 'clean-po', 'Removes all unused strings in po files.')
