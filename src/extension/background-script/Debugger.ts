import { getSharedListOfPost } from './CryptoService'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import { gun } from '../../network/gun/version.1'

Object.assign(window, {
    debug: {
        getPostAESKeyShareTarget(post: string) {
            return getSharedListOfPost(deconstructPayload(post)!.iv)
        },
    },
    gun1: gun,
})
