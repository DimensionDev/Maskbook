import { runBundler } from '../extension/index.ts'
import { extensionArgsParser } from './args.ts'

runBundler('rspack', extensionArgsParser('development'))
