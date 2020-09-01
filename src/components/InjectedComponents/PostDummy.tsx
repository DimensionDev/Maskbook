import React, { useEffect } from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import { PluginUI } from '../../plugins/plugin'
import { makeTypedMessageCompound, isTypedMessageSuspended, isTypedMessageKnown } from '../../protocols/typed-message'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentWholePostVisibilitySettings, WholePostVisibility } from '../../settings/settings'

export interface PostDummyProps {
    zip?: () => void
    unzip?: () => void
}

export function PostDummy(props: PostDummyProps) {
    const parsedPostContent = usePostInfoDetails('parsedPostContent')
    const postPayload = usePostInfoDetails('postPayload')
    const wholePostVisibilitySettings = useValueRef(currentWholePostVisibilitySettings)

    const processedPostMessage = Array.from(PluginUI.values()).reduce(
        (x, plugin) => (plugin.postMessageProcessor ? plugin.postMessageProcessor(x) : x),
        parsedPostContent,
    )
    const postDummyVisible =
        // render dummy for all posts
        wholePostVisibilitySettings === WholePostVisibility.all ||
        // render dummy for posts which enhanced by plugins
        (wholePostVisibilitySettings === WholePostVisibility.enhancedOnly &&
            processedPostMessage.items.some((x) => !isTypedMessageKnown(x))) ||
        // render dummy for posts which encrypted by maskbook
        (wholePostVisibilitySettings === WholePostVisibility.encryptedOnly && postPayload.ok)

    console.log(`DEBUG: postDummyVisible`)
    console.log({
        postDummyVisible,
        wholePostVisibilitySettings,
    })

    // zip original post
    useEffect(() => {
        if (postDummyVisible) props.zip?.()
        else props.unzip?.()
    }, [postDummyVisible])

    return postDummyVisible ? (
        <DefaultTypedMessageRenderer
            message={makeTypedMessageCompound(processedPostMessage.items.filter((x) => !isTypedMessageSuspended(x)))}
        />
    ) : null
}
