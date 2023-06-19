import { fromNPMTask, PKG_PATH } from '../utils/index.js'
export const [buildMaskSDK, watchMaskSDK] = fromNPMTask(
    //
    new URL('mask-sdk/', PKG_PATH),
    'mask-sdk',
    'Build Mask SDK.',
)
