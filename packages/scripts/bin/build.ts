import { runBundler } from '../extension/index.ts'
import { extensionArgsParser } from './args.ts'

await runBundler('webpack', extensionArgsParser('production'))
