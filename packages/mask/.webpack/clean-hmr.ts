import { join } from 'path'
import { rimraf } from 'rimraf'

rimraf('hot*', {
    glob: { cwd: join(__dirname, '../../../dist') },
})
