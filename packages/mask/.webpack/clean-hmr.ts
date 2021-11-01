import { join } from 'path'
import rimraf from 'rimraf'

rimraf(join(__dirname, '../../../dist/hot*'), () => {})
