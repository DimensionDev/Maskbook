import React from 'react'
import { usePostInfoDetails } from '../DataSource/usePostInfo'
import { DefaultTypedMessageRenderer } from './TypedMessageRenderer'
import { PluginUI } from '../../plugins/plugin'

export interface PostDummyProps {}

export function PostDummy(props: PostDummyProps) {
    const postMessage = usePostInfoDetails('parsedPostContent')
    const processedPostMessage = Array.from(PluginUI.values()).reduce(
        (x, plugin) => (plugin.postMessageProcessor ? plugin.postMessageProcessor(x) : x),
        postMessage,
    )
    return <DefaultTypedMessageRenderer message={processedPostMessage}></DefaultTypedMessageRenderer>
}
