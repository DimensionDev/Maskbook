import { awaitChildProcess } from '../utils/awaitChildProcess.ts'
import { shell } from '../utils/run.ts'
import { getLinguiEnabledPackages } from './getLinguiEnabledPackages.ts'

const folders = await getLinguiEnabledPackages()
await awaitChildProcess(
    shell`pnpm -r --no-reporter-hide-prefix --aggregate-output --reporter=append-only --parallel ${folders.map((x) => '--filter ' + x).join(' ')} exec lingui extract`,
)
