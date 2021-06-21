import { CurrentSNSNetwork, PostInfoProvider, startPluginSNSAdaptor } from '@masknet/plugin-infra'
import { useMemo } from 'react'
import { DOMProxy } from '@dimensiondev/holoflows-kit'
import { useEffect } from 'react'
import { makeTypedMessageText, makeTypedMessageTupleFromList, ProfileIdentifier } from '@masknet/shared'
import { PostInspector } from '../../../components/InjectedComponents/PostInspector'
import { noop } from 'lodash-es'
import { deconstructPayload } from '../../../utils'
import { createPluginHost } from '../../../plugin-infra/host'
import {
    createRefsForCreatePostContext,
    createSNSAdaptorSpecializedPostContext,
} from '../../../social-network/utils/create-post-context'
import { facebookShared } from '../../../social-network-adaptor/facebook.com/shared'
import { instagramShared } from '../../../social-network-adaptor/instagram.com/shared'
import { mindsShared } from '../../../social-network-adaptor/minds.com/shared'
import { twitterShared } from '../../../social-network-adaptor/twitter.com/shared'
import { PostReplacer } from '../../../components/InjectedComponents/PostReplacer'

export type PostInfoItems = {
    author: string | null
    id: string | null
    snsAdaptor: CurrentSNSNetwork
    content: string | null
    image: string | null
    currentIdentity: ProfileIdentifier
    link: string | null
}
const unknownPostContext = createSNSAdaptorSpecializedPostContext({
    payloadParser: deconstructPayload,
})
function getSNSPostInfo(x: CurrentSNSNetwork) {
    const table: Record<CurrentSNSNetwork, ReturnType<typeof createSNSAdaptorSpecializedPostContext>> = {
        [CurrentSNSNetwork.Facebook]: facebookShared.utils.createPostContext,
        [CurrentSNSNetwork.Instagram]: instagramShared.utils.createPostContext,
        [CurrentSNSNetwork.Minds]: mindsShared.utils.createPostContext,
        [CurrentSNSNetwork.Twitter]: twitterShared.utils.createPostContext,
        [CurrentSNSNetwork.Unknown]: unknownPostContext,
    }
    return table[x]
}
function getNetwork(x: CurrentSNSNetwork, id: string | null) {
    if (x === CurrentSNSNetwork.Unknown || !id) return ProfileIdentifier.unknown
    const table: Record<CurrentSNSNetwork, string> = {
        [CurrentSNSNetwork.Facebook]: 'facebook.com',
        [CurrentSNSNetwork.Instagram]: 'instagram.com',
        [CurrentSNSNetwork.Minds]: 'minds.io',
        [CurrentSNSNetwork.Twitter]: 'twitter.com',
        [CurrentSNSNetwork.Unknown]: 'localhost',
    }
    return new ProfileIdentifier(table[x], id)
}
export function MockPostInfoProvider({ snsAdaptor, author, content, id, image, link, currentIdentity }: PostInfoItems) {
    const [postInfo, refs] = useMemo(() => {
        const creator = getSNSPostInfo(snsAdaptor)
        const { subscriptions, ...refs } = createRefsForCreatePostContext()
        return [
            creator({
                comments: undefined,
                rootElement: DOMProxy(),
                suggestedInjectionPoint: document.createElement('div'),
                ...subscriptions,
            }),
            refs,
        ] as const
    }, [snsAdaptor])
    useEffect(() => {
        refs.postMessage.value = makeTypedMessageTupleFromList(makeTypedMessageText(content || ''))
        refs.postID.value = id
    }, [refs, content, id])
    useEffect(() => {
        refs.postBy.value = getNetwork(snsAdaptor, author)
    }, [refs, author])
    useEffect(() => {
        refs.postMetadataImages.clear()
        image && refs.postMetadataImages.add(image)
    }, [refs, image])
    useEffect(() => {
        refs.postMetadataMentionedLinks.clear()
        link && refs.postMetadataMentionedLinks.set(0, link)
    }, [refs, link])
    useEffect(() => {
        const signal = new AbortController()
        startPluginSNSAdaptor(snsAdaptor, createPluginHost(signal.signal))
        return () => signal.abort()
    }, [snsAdaptor])
    return (
        <PostInfoProvider post={postInfo}>
            <PostReplacer shouldReplace />
            <PostInspector
                publicKeyUIDecoder={(x) => [x]}
                currentIdentity={currentIdentity}
                needZip={noop}
                onDecrypted={noop}
            />
        </PostInfoProvider>
    )
}
