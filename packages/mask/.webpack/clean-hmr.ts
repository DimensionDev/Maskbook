import { rimraf } from 'rimraf'

rimraf('hot*', {
    glob: { cwd: new URL('../../../dist', import.meta.url) },
})
