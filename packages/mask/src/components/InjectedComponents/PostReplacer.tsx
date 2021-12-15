import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { useValueRef } from '@masknet/shared'
import {
    isTypedMessagePromise,
    isTypedMessageTuple,
    isWellKnownTypedMessages,
    makeTypedMessageTuple,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo } from 'react'
import { Result } from 'ts-results'
import { allPostReplacementSettings } from '../../settings/settings'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'
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
    const postMessage = usePostInfoDetails.postMessage()
    const postPayload = usePostInfoDetails.postPayload()
    const allPostReplacement = useValueRef(allPostReplacementSettings)

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
        // replace all posts
        allPostReplacement ||
        // replace posts which enhanced by plugins
        processedPostMessage.items.some((x) => !isWellKnownTypedMessages(x)) ||
        // replace posts which encrypted by Mask
        postPayload.ok

    // zip/unzip original post
    useEffect(() => {
        if (shouldReplacePost) props.zip?.()
        else props.unzip?.()
    }, [shouldReplacePost])

    return shouldReplacePost ? (
        <span className={classes.root}>
            <DefaultTypedMessageRenderer
                message={makeTypedMessageTuple(processedPostMessage.items.filter((x) => !isTypedMessagePromise(x)))}
            />
        </span>
    ) : null
}
