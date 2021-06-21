import { CurrentSNSNetwork } from '@dimensiondev/mask-plugin-infra'
import { Box } from '@material-ui/core'
import { Mock } from './mock'
import { useParams, useHistory } from 'react-router'
import { useQueryParams } from '../../../utils'
import { ReplicaRoute } from '../types'
import { MockPostInfoProvider, PostInfoItems } from './provider'
import { Identifier, ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export default function PostInspectorSimulator() {
    const params = usePostInspectorParams()
    const { author, content, id, image, snsAdaptor, currentIdentity, update } = params

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', maxWidth: 500 }}>
            <MockPostInfoProvider {...params} />
            <Mock
                network={snsAdaptor}
                onNetworkChange={update('snsAdaptor')}
                author={author || ''}
                onAuthorChanged={update('author')}
                id={id || ''}
                onIdChanged={update('id')}
                content={content || ''}
                onContentChanged={update('content')}
                image={image || ''}
                onImageChanged={update('image')}
                currentIdentity={currentIdentity.userId}
                onCurrentIdentityChanged={(next) =>
                    update('currentIdentity')(new ProfileIdentifier(currentIdentity.network, next))
                }
            />
        </Box>
    )
}
const map: Record<string, CurrentSNSNetwork> = {
    twitter: CurrentSNSNetwork.Twitter,
    facebook: CurrentSNSNetwork.Facebook,
    minds: CurrentSNSNetwork.Minds,
    instagram: CurrentSNSNetwork.Instagram,
}
const reverseMap: Record<CurrentSNSNetwork, string> = {
    [CurrentSNSNetwork.Twitter]: 'twitter',
    [CurrentSNSNetwork.Facebook]: 'facebook',
    [CurrentSNSNetwork.Minds]: 'minds',
    [CurrentSNSNetwork.Instagram]: 'instagram',
    [CurrentSNSNetwork.Unknown]: 'undefined',
}
function usePostInspectorParams() {
    const { SNSAdaptor } = useParams<Record<'SNSAdaptor', string>>()
    const { content, image, author, id, me } = useQueryParams(['content', 'image', 'author', 'id', 'me'] as const)
    const snsAdaptor = SNSAdaptor in map ? map[SNSAdaptor] : CurrentSNSNetwork.Unknown
    const currentIdentity = Identifier.fromString(me || '', ProfileIdentifier).unwrapOr(ProfileIdentifier.unknown)
    const current: PostInfoItems = {
        author,
        id,
        snsAdaptor,
        content,
        image,
        currentIdentity,
    }
    const history = useHistory()
    return {
        snsAdaptor,
        author,
        id,
        content,
        image,
        currentIdentity,
        update<T extends keyof PostInfoItems>(part: T) {
            return (newValue: PostInfoItems[T]) => {
                const next = { ...current, [part]: newValue }
                const params = new URLSearchParams()
                next.content && params.set('content', next.content)
                next.image && params.set('image', next.image)
                next.id && params.set('id', next.id)
                next.author && params.set('author', next.author)
                !next.currentIdentity.isUnknown && params.set('me', next.currentIdentity.toText())
                const nextURL = `${ReplicaRoute.PostInspector}/${reverseMap[next.snsAdaptor]}/?${params.toString()}`
                history.replace(nextURL)
            }
        },
    }
}
