import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import { Box } from '@material-ui/core'
import { Mock } from './mock'
import { useParams, useHistory } from 'react-router'
import { useQueryParams } from '../../../utils'
import { PopupRoutes } from '..'

export default function PostInspectorSimulator() {
    const params = usePostInspectorParams()
    const { author, content, id, image, snsAdaptor, update } = params

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
    const { content, image, author, id } = useQueryParams(['content', 'image', 'author', 'id'] as const)
    const snsAdaptor = SNSAdaptor in map ? map[SNSAdaptor] : CurrentSNSNetwork.Unknown
    const current: Obj = { author, id, snsAdaptor, content, image }
    const history = useHistory()
    return {
        snsAdaptor,
        author,
        id,
        content,
        image,
        update<T extends keyof Obj>(part: T) {
            return (newValue: Obj[T]) => {
                const next = { ...current, [part]: newValue }
                const params = new URLSearchParams()
                next.content && params.set('content', next.content)
                next.image && params.set('image', next.image)
                next.id && params.set('id', next.id)
                next.author && params.set('author', next.author)
                const nextURL = `${PopupRoutes.PostInspector}/${reverseMap[next.snsAdaptor]}/?${params.toString()}`
                history.replace(nextURL)
            }
        },
    }
}
type Obj = {
    author: string | null
    id: string | null
    snsAdaptor: CurrentSNSNetwork
    content: string | null
    image: string | null
}
