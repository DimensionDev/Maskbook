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
                console.log(str)
                const time = '1970-01-01 00:00+0000'
                const next = str.slice(0, 39) + time + str.slice(60)
                if (str !== next) return writeFile(file, next)
                return
            }),
        ),
    )
}

task(lintPo, 'lint-po', 'Lint all po files.')
