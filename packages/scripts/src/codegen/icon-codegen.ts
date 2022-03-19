import { src, watch } from 'gulp'
import { ROOT_PATH, watchTask } from '../utils'
import glob from 'glob-promise'

const pattern = 'packages/*/**/*.icon.@(svg|jpe?g|png)'
export async function generateIcons() {
    const list = await glob.promise(pattern, { cwd: ROOT_PATH, nodir: true })
    console.log(list)
}

export async function generateIconsWatch() {
    watch(pattern, generateIcons)
}

watchTask(generateIcons, generateIconsWatch, 'icon-codegen', 'Generate icons')
