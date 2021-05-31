import {
    isTypedMessagePromise,
    isWellKnownTypedMessages,
    makeTypedMessageTuple,
    useValueRef,
} from '@dimensiondev/maskbook-shared'
import { makeStyles, Theme } from '@material-ui/core'
import { useEffect, useMemo } from 'react'
import { Result } from 'ts-results'
import { PluginUI } from '../../plugins/PluginUI'
import { allPostReplacementSettings } from '../../settings/settings'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'

const useStlyes = makeStyles((theme: Theme) => ({
    root: {
        overflowWrap: 'break-word',
    },
}))

export interface PostReplacerProps {
    zip?: () => void
    unzip?: () => void
}

export function PostReplacer(props: PostReplacerProps) {
    const classes = useStlyes()
    const postMessage = usePostInfoDetails('postMessage')
    const postPayload = usePostInfoDetails('postPayload')
    const allPostReplacement = useValueRef(allPostReplacementSettings)

    const plugins = [...PluginUI.values()]
    const processedPostMessage = useMemo(
        () =>
            plugins.reduce(
                (x, plugin) => Result.wrap(() => plugin.messageProcessor?.(x) ?? x).unwrapOr(x),
                postMessage,
            ),
        [plugins.map((x) => x.identifier).join(), postMessage],
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
