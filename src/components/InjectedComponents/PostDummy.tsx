import React from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import { PluginUI } from '../../plugins/plugin'
import { makeTypedMessageCompound, isTypedMessageSuspended } from '../../protocols/typed-message'

export interface PostDummyProps {}

export function PostDummy(props: PostDummyProps) {
    const postMessage = usePostInfoDetails('parsedPostContent')
    const processedPostMessage = Array.from(PluginUI.values()).reduce(
        (x, plugin) => (plugin.postMessageProcessor ? plugin.postMessageProcessor(x) : x),
        postMessage,
    )
    return (
        <DefaultTypedMessageRenderer
            message={makeTypedMessageCompound(processedPostMessage.items.filter((x) => !isTypedMessageSuspended(x)))}
        />
    )
}
