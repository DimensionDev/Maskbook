import { fromNPMTask, PKG_PATH } from '../utils/index.ts'
export const [buildGun] = fromNPMTask(
    //
    new URL('gun-utils/', PKG_PATH),
    'gun',
    'Build gun required for Mask Network.',
)
