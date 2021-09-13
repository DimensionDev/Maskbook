import { fromNPMTask } from '../utils'
import { resolve } from 'path'
export const [buildMaskSDK, watchMaskSDK] = fromNPMTask(
    resolve(__dirname, '../../../mask-sdk'),
    'mask-sdk',
    'Build Mask SDK.',
)
