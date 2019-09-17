import { nop } from '../../utils/utils'
import { cloneDeep } from 'lodash-es'

export const defaultSocialNetworkWorker = cloneDeep({
    autoVerifyBio: nop,
    autoVerifyPost: nop,
    manualVerifyPost: nop,
})
