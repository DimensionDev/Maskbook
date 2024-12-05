import { extensionArgsParser } from './args.ts'
import { runBundler } from '../extension/normal.ts'

runBundler('rspack', extensionArgsParser('development'))
