import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import { Box } from '@material-ui/core'
import { Mock } from './mock'
import { useParams } from 'react-router'
import { useQueryParams } from '../../../utils'
import { useState } from 'react'

export default function PostInspectorSimulator() {
    const [sns, author, id, content, image] = usePostInspectorParams()
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Mock network={sns} author={author} id={id} content={content} image={image} />
        </Box>
    )
}

function usePostInspectorParams() {
    const a = useParams<Record<'SNSAdaptor' | 'author' | 'id', string>>()
    const b = useQueryParams(['content', 'image'] as const)
    const snsAdaptor =
        a.SNSAdaptor === 'twitter'
            ? CurrentSNSNetwork.Twitter
            : a.SNSAdaptor === 'facebook'
            ? CurrentSNSNetwork.Facebook
            : CurrentSNSNetwork.Unknown
    return [
        //
        useState(snsAdaptor),
        useState(a.author),
        useState(a.id),
        useState(b.content || ''),
        useState(b.image || ''),
    ] as const
}
