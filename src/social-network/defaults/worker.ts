import { cloneDeep } from 'lodash-es'

export const defaultSocialNetworkWorker = cloneDeep({
    autoVerifyBio: null,
    autoVerifyPost: null,
    manualVerifyPost: null,
})
