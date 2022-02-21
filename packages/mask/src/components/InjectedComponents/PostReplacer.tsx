import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import {
    isTypedMessagePromise,
    isTypedMessageTuple,
    isWellKnownTypedMessages,
    makeTypedMessageTuple,
    TransformationContext,
    TypedMessage,
} from '@masknet/typed-message'
import { TypedMessageRender, useTransformedValue } from '@masknet/typed-message/dom'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo } from 'react'
import { Result } from 'ts-results'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { TypedMessageRenderContext } from '../../../shared-ui/TypedMessageRender/context'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import { PluginRendererWithSuggestion } from './DecryptedPostMetadataRender'

const useStyles = makeStyles()({
    root: {
        overflowWrap: 'break-word',
    },
})

export interface PostReplacerProps {
    zip?: () => void
    unzip?: () => void
}

export function PostReplacer(props: PostReplacerProps) {
    const { classes } = useStyles()
    const postMessage = usePostInfoDetails.rawMessage()
    const postPayload = usePostInfoDetails.containingMaskPayload()

    const author = usePostInfoDetails.author()
    const currentProfile = useCurrentIdentity()?.identifier
    const url = usePostInfoDetails.url()

    const plugins = useActivatedPluginsSNSAdaptor(false)
    const processedPostMessage = useMemo(
        () =>
            plugins.reduce((x, plugin) => {
                const result = Result.wrap(() => plugin.typedMessageTransformer?.(x) ?? x).unwrapOr(x)
                if (isTypedMessageTuple(result)) return result
                console.warn(
                    '[TypedMessage] typedMessageTransformer that return a non TypedMessageTuple is not supported yet. This transform is ignored',
                    result,
                )
                return x
            }, postMessage),
        [plugins.map((x) => x.ID).join(), postMessage],
    )
    const shouldReplacePost =
        // replace posts which enhanced by plugins
        processedPostMessage.items.some((x) => !isWellKnownTypedMessages(x)) ||
        // replace posts which encrypted by Mask
        postPayload.ok

    // zip/unzip original post
    useEffect(() => {
        if (shouldReplacePost) props.zip?.()
        else props.unzip?.()
    }, [shouldReplacePost])

    const initialTransformationContext = useMemo((): TransformationContext => {
        return {
            authorHint: author,
            currentProfile,
            postURL: url?.toString(),
        }
    }, [author, currentProfile, url])

    return shouldReplacePost ? (
        <span className={classes.root}>
            <TypedMessageRenderContext
                context={initialTransformationContext}
                metadataRender={PluginRendererWithSuggestion}>
                <Transformer message={postMessage} />
            </TypedMessageRenderContext>
            <TypedMessageRender
                message={makeTypedMessageTuple(processedPostMessage.items.filter((x) => !isTypedMessagePromise(x)))}
            />
        </span>
    ) : null
}

function Transformer(props: { message: TypedMessage }) {
    const after = useTransformedValue(props.message)
    return <TypedMessageRender message={after} />
}
