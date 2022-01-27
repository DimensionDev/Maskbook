import {
    createMaskPayloadTransform,
    makeTypedMessageEmpty,
    makeTypedMessageMaskPayload,
    makeTypedMessagePromise,
    makeTypedMessageText,
    TransformationContext,
    TypedMessage,
} from '@masknet/typed-message/base'
import { TypedMessageTransformers, Order } from '../../../shared-ui/TypedMessageRender/transformer'
import { DecryptProgress, DecryptProgressKind, SocialNetworkEnum } from '@masknet/encryption'
import { ServicesWithProgress } from '../../extension/service'
import { ProfileIdentifier } from '@masknet/shared-base'
import type { DecryptionInfo } from '../../../background/services/crypto'

export function registerMaskPayloadTransformer(network: SocialNetworkEnum) {
    return TypedMessageTransformers.addTransformer(
        createMaskPayloadTransform({
            removePrefixText: [],
            removePostfixText: [],
            transformText(text, context) {
                const { authorHint, currentProfile, postURL } = context
                const generator = ServicesWithProgress.decryptionWithSocialNetworkDecoding(
                    { type: 'text', text },
                    {
                        currentSocialNetwork: network,
                        authorHint: authorHint ? new ProfileIdentifier(authorHint.network, authorHint.userId) : null,
                        currentProfile: currentProfile
                            ? new ProfileIdentifier(currentProfile.network, currentProfile.userId)
                            : null,
                        postURL,
                    },
                )
                const f = iter(generator, context)
                return makeTypedMessagePromise(generator.next().then(f))
            },
            transformImage(image, context) {
                // We return Empty for early returns because we don't hide replace images on SNS and we don't want duplicated images.
                if (typeof image.image !== 'string') return makeTypedMessageEmpty()
                if (!context.authorHint) return makeTypedMessageEmpty()

                const { authorHint, currentProfile, postURL } = context
                // Note: image decryption requires authorHint. If this field is missing, we shall early return.
                const generator = ServicesWithProgress.decryptionWithSocialNetworkDecoding(
                    { type: 'image-url', image: image.image },
                    {
                        currentSocialNetwork: network,
                        authorHint: new ProfileIdentifier(authorHint.network, authorHint.userId),
                        currentProfile: currentProfile
                            ? new ProfileIdentifier(currentProfile.network, currentProfile.userId)
                            : null,
                        postURL,
                    },
                )
                const f = iter(generator, context)
                return makeTypedMessagePromise(generator.next().then(f))
            },
        }),
        Order.MaskPayload,
    )
}

function iter(gen: AsyncGenerator<DecryptProgress | DecryptionInfo, void, undefined>, context: TransformationContext) {
    return function iter_inner(result: IteratorResult<DecryptProgress | DecryptionInfo>): TypedMessage {
        // should not happen.
        if (result.done) {
            console.warn('Unreachable case')
            return makeTypedMessageEmpty()
        }

        const progress = result.value
        if (progress.type === DecryptProgressKind.Info) {
            context.reportDecryptedInfo?.(progress.iv, progress.claimedAuthor, progress.publicShared)
            return makeTypedMessagePromise(gen.next().then(iter_inner), makeTypedMessageText('[Mask]'))
        } else if (progress.type === DecryptProgressKind.Success) {
            return makeTypedMessageMaskPayload(progress.content)
        } else if (progress.type === DecryptProgressKind.Error) {
            return makeTypedMessageText(String(progress.message))
        }

        return makeTypedMessagePromise(gen.next().then(iter_inner))
    }
}
