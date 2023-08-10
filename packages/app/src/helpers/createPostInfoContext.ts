import { DOMProxy } from '@dimensiondev/holoflows-kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import {
    NULL,
    UNDEFINED,
    TRUE,
    FALSE,
    EMPTY_ARRAY,
    ValueRefWithReady,
    createConstantSubscription,
} from '@masknet/shared-base'
import { makeTypedMessageEmpty, makeTypedMessageTuple } from '@masknet/typed-message'

const emptyValueRef = new ValueRefWithReady<any>()

export const INJECTION_NODE_ID = 'post-info-injection-id'

export function createPostInfoContext(): PostInfo {
    return {
        nickname: NULL,
        avatarURL: NULL,
        author: NULL,
        postID: NULL,

        get rootNode() {
            return null
        },
        rootElement: DOMProxy(),
        suggestedInjectionPoint: document.body,
        comment: undefined,
        identifier: NULL,
        url: NULL,
        coAuthors: NULL,
        mentionedLinks: EMPTY_ARRAY,
        postMetadataImages: EMPTY_ARRAY,
        rawMessage: createConstantSubscription(makeTypedMessageTuple([makeTypedMessageEmpty()])),
        encryptComment: emptyValueRef,
        decryptComment: emptyValueRef,
        hasMaskPayload: TRUE,
        postIVIdentifier: NULL,
        publicShared: TRUE,
        isAuthorOfPost: FALSE,
        version: UNDEFINED,
        decryptedReport(content) {
            throw new Error('To be implemented.')
        },
    }
}
