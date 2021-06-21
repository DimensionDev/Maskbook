import { CurrentSNSNetwork, PostInfo, PostInfoProvider } from '@dimensiondev/mask-plugin-infra'
import { useMemo } from 'react'
import { DOMProxy } from '@dimensiondev/holoflows-kit'
import { useEffect } from 'react'
import { ProfileIdentifier, unreachable } from '@dimensiondev/maskbook-shared'
import { PostInspector } from '../../../components/InjectedComponents/PostInspector'
import { noop } from 'lodash-es'
import { twitterEncoding } from '../../../social-network-adaptor/twitter.com/encoding'
import { deconstructPayload } from '../../../utils'

export type PostInfoItems = {
    author: string | null
    id: string | null
    snsAdaptor: CurrentSNSNetwork
    content: string | null
    image: string | null
    currentIdentity: ProfileIdentifier
}
class MockPostInfo extends PostInfo {
    private decoder: (x: string) => string[]
    parsePayload(x: string) {
        return deconstructPayload(x, this.decoder)
    }
    constructor(private sns: CurrentSNSNetwork) {
        super()
        let f = (x: string) => [x]
        switch (sns) {
            case CurrentSNSNetwork.Twitter:
                f = twitterEncoding.payloadDecoder
                break
            case CurrentSNSNetwork.Facebook:
            case CurrentSNSNetwork.Instagram:
            case CurrentSNSNetwork.Minds:
            case CurrentSNSNetwork.Unknown:
                break
            default:
                unreachable(sns)
        }
        this.decoder = f
    }
    commentBoxSelector = undefined
    postContentNode = undefined
    commentsSelector = undefined
    rootNode = document.createElement('div')
    rootNodeProxy = DOMProxy()
    setAuthor(x: string) {
        const table: Record<CurrentSNSNetwork, string> = {
            [CurrentSNSNetwork.Facebook]: 'facebook.com',
            [CurrentSNSNetwork.Instagram]: 'instagram.com',
            [CurrentSNSNetwork.Minds]: 'minds.io',
            [CurrentSNSNetwork.Twitter]: 'twitter.com',
            [CurrentSNSNetwork.Unknown]: 'localhost',
        }
        this.postBy.value = new ProfileIdentifier(table[this.sns], x)
    }
}
export function MockPostInfoProvider({ snsAdaptor, author, content, id, image, currentIdentity }: PostInfoItems) {
    const postInfo = useMemo(() => new MockPostInfo(snsAdaptor), [snsAdaptor])
    useEffect(() => {
        postInfo.postContent.value = content || ''
        postInfo.postID.value = id
    }, [postInfo, content, id])
    useEffect(() => {
        postInfo.setAuthor(author || '')
    }, [postInfo, author])
    useEffect(() => {
        postInfo.postMetadataImages.clear()
        image && postInfo.postMetadataImages.add(image)
    }, [postInfo, image])
    return (
        <PostInfoProvider post={postInfo}>
            <PostInspector
                publicKeyUIDecoder={(x) => [x]}
                currentIdentity={currentIdentity}
                needZip={noop}
                onDecrypted={noop}
            />
        </PostInfoProvider>
    )
}
