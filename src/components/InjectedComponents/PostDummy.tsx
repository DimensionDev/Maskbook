import React from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import { PluginUI } from '../../plugins/plugin'
import { makeTypedMessageCompound, isTypedMessageSuspended, isTypedMessageKnown } from '../../protocols/typed-message'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentWholePostVisibilitySettings, WholePostVisibility } from '../../settings/settings'

export interface PostDummyProps {}

export function PostDummy(props: PostDummyProps) {
    const parsedPostContent = usePostInfoDetails('parsedPostContent')
    const postPayload = usePostInfoDetails('postPayload')
    const wholePostVisibilitySettings = useValueRef(currentWholePostVisibilitySettings)

    const processedPostMessage = Array.from(PluginUI.values()).reduce(
        (x, plugin) => (plugin.postMessageProcessor ? plugin.postMessageProcessor(x) : x),
        parsedPostContent,
    )

    // render dummy for posts which enhanced by plugins
    if (
        wholePostVisibilitySettings === WholePostVisibility.enhancedOnly &&
        processedPostMessage.items.every(isTypedMessageKnown)
    )
        return null

    // render dummy for posts which encrypted by maskbook
    if (wholePostVisibilitySettings === WholePostVisibility.encryptedOnly && !postPayload.ok) return null

    // render dummy for all posts
    return (
        <DefaultTypedMessageRenderer
            message={makeTypedMessageCompound(processedPostMessage.items.filter((x) => !isTypedMessageSuspended(x)))}
        />
    )
}
