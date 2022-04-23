import { fromNPMTask } from '../utils'
import { resolve } from 'path'
export const [buildGun] = fromNPMTask(
    resolve(__dirname, '../../../gun-utils'),
    'gun',
    'Build gun required for Mask Network.',
)
