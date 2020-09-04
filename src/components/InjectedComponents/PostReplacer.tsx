import React, { useEffect, useMemo } from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import { PluginUI } from '../../plugins/plugin'
import { makeTypedMessageCompound, isTypedMessageSuspended, isTypedMessageKnown } from '../../protocols/typed-message'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { allPostReplacementSettings } from '../../settings/settings'
import { makeStyles, Theme } from '@material-ui/core'

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
    const postContent = usePostInfoDetails('postContent')
    const postMessage = usePostInfoDetails('postMessage')
    const postPayload = usePostInfoDetails('postPayload')
    const allPostReplacement = useValueRef(allPostReplacementSettings)

    const plugins = [...PluginUI.values()]
    const processedPostMessage = useMemo(
        () => plugins.reduce((x, plugin) => plugin.messageProcessor?.(x) ?? x, postMessage),
        [plugins.map((x) => x.identifier).join(), postContent],
    )
    const shouldReplacePost =
        // replace all posts
        allPostReplacement ||
        // replace posts which enhanced by plugins
        (!allPostReplacement && processedPostMessage.items.some((x) => !isTypedMessageKnown(x))) ||
        // replace posts which encrypted by maskbook
        (!allPostReplacement && postPayload.ok)

    // zip/unzip original post
    useEffect(() => {
        if (shouldReplacePost) props.zip?.()
        else props.unzip?.()
    }, [shouldReplacePost])

    return shouldReplacePost ? (
        <span className={classes.root}>
            <DefaultTypedMessageRenderer
                message={makeTypedMessageCompound(
                    processedPostMessage.items.filter((x) => !isTypedMessageSuspended(x)),
                )}
            />
        </span>
    ) : null
}
