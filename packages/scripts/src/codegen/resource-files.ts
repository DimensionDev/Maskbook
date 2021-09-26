import { watchTask } from '../utils'
import { join } from 'path'
import { src, dest, watch, series } from 'gulp'

const Shared = join(__dirname, '../../../shared/')
export function resourceCopy() {
    return src('./src/**/*.png', { cwd: Shared }).pipe(dest('./dist', { cwd: Shared }))
}
export function resourceCopyWatch() {
    return watch('./src/**/*.png', { cwd: Shared }, series(resourceCopy))
}
watchTask(resourceCopy, resourceCopyWatch, 'resource-copy', 'Copy resources')
