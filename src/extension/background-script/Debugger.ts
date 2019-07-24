import { getSharedListOfPost } from './CryptoService'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import { gun } from '../../network/gun/version.1'
import { PostIdentifier, PersonIdentifier } from '../../database/type'

Object.assign(window, {
    debug: {
        getPostAESKeyShareTarget(post: string, postBy = PersonIdentifier.unknown) {
            return getSharedListOfPost(deconstructPayload(post)!.iv, postBy)
        },
    },
    gun1: gun,
})
