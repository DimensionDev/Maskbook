import { join } from 'path'
import rimraf = require('rimraf')

rimraf(join(__dirname, '../../../dist/hot*'), () => {})
