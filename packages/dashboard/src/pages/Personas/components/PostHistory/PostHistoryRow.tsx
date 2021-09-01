import { Stack, Typography } from '@material-ui/core'
import { memo, ReactNode, useMemo } from 'react'
import { FileMessageIcon, ITOIcon, MessageIcon, RedPacketIcon, PollIcon } from '@masknet/icons'
import { getMaskColor } from '@masknet/theme'
import { Services } from '../../../../API'
import type { PostRecord } from '@masknet/shared'

const SUPPORT_PLUGIN: Record<string, ReactNode> = {
    text: <MessageIcon sx={{ width: 48, height: 48 }} />,
    'com.maskbook.fileservice:1': <FileMessageIcon sx={{ width: 48, height: 48 }} />,
    'com.maskbook.fileservice:2': <FileMessageIcon sx={{ width: 48, height: 48 }} />,
    'com.maskbook.red_packet:1': <RedPacketIcon sx={{ width: 48, height: 48 }} />,
    'com.maskbook.ito:1': <ITOIcon sx={{ width: 48, height: 48 }} />,
    'com.maskbook.ito:2': <ITOIcon sx={{ width: 48, height: 48 }} />,
    'com.maskbook.poll:1': <PollIcon sx={{ width: 48, height: 48 }} />,
}

interface PostHistoryRowProps {
    post: PostRecord
}

export const PostHistoryRow = memo(({ post }: PostHistoryRowProps) => {
    const postIcon = useMemo(() => {
        const { interestedMeta } = post
        const plugin = interestedMeta?.keys().next().value ?? 'text'
        return SUPPORT_PLUGIN[plugin] ?? <MessageIcon sx={{ width: 48, height: 48 }} />
    }, [post.interestedMeta])

    const allRecipients = useMemo(() => {
        const { recipients } = post
        if (recipients === 'everyone') return ['Everyone']

        const { __raw_map__: raws } = recipients
        const keys = [...raws.keys()]

        return keys.length ? keys.map((x) => x.replace(/^.*\//, '@')) : ['Myself']
    }, [post.recipients])

    return <PostHistoryRowUI icon={postIcon} recipients={allRecipients} post={post} />
})

interface PostHistoryRowUIProps extends PostHistoryRowProps {
    icon: ReactNode
    recipients: string[]
}

const PostHistoryRowUI = memo<PostHistoryRowUIProps>(({ post, icon, recipients }) => {
    return (
        <Stack direction="row" gap={1.5} sx={{ mb: 3 }} alignItems="center">
            {icon}
            <Stack
                justifyContent="space-around"
                sx={{ cursor: 'pointer' }}
                gap={0.3}
                onClick={() => post.url && Services.Settings.openTab(post.url)}>
                <Typography component="p" variant="body2">
                    {post.summary}
                </Typography>
                <Typography component="p" variant="body2" sx={{ color: (theme) => getMaskColor(theme).textSecondary }}>
                    {recipients.map((recipient) => (
                        <Typography key={recipient} component="span" variant="body2" sx={{ mr: 1 }}>
                            {recipient}
                        </Typography>
                    ))}
                </Typography>
            </Stack>
        </Stack>
    )
})
