import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { memo, ReactNode, useCallback, useMemo } from 'react'
import { FileMessageIcon, ITOIcon, MessageIcon, PollIcon, RedPacketIcon, NFTRedPacketIcon } from '@masknet/icons'
import { getMaskColor, MaskColorVar, makeStyles } from '@masknet/theme'
import { Services } from '../../../../API'
import type { PostInformation } from '@masknet/shared-base'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { PluginId } from '@masknet/plugin-infra'
import { openWindow } from '@masknet/shared-base-ui'

const MSG_DELIMITER = '2c1aca02'

const useStyles = makeStyles()((theme) => {
    return {
        hover: {
            '&:hover': {
                backgroundColor: theme.palette.background.default,
            },
            alignItems: 'center',
            padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
            borderRadius: '8px',
        },
    }
})

const parseFileServiceMessage = (body: any) => {
    const link = `https://arweave.net/${body.landingTxID}/#${body.key}`
    return (
        <Link underline="none" target="_blank" rel="noopener noreferrer" href={link}>
            {body.name}
        </Link>
    )
}

const SUPPORT_PLUGIN: Record<
    string,
    { pluginId: null | string; icon: ReactNode; messageParse: (body: any) => ReactNode }
> = {
    text: {
        pluginId: null,
        icon: <MessageIcon />,
        messageParse: () => null,
    },
    'com.maskbook.fileservice:1': {
        pluginId: null,
        icon: <FileMessageIcon />,
        messageParse: parseFileServiceMessage,
    },
    'com.maskbook.fileservice:2': {
        pluginId: null,
        icon: <FileMessageIcon />,
        messageParse: parseFileServiceMessage,
    },
    'com.maskbook.red_packet:1': {
        pluginId: PluginId.RedPacket,
        icon: <RedPacketIcon />,
        messageParse: (body: any) => body.sender.message,
    },
    'com.maskbook.red_packet_nft:1': {
        pluginId: PluginId.RedPacket,
        icon: <NFTRedPacketIcon />,
        messageParse: (body: { message: string }) => body.message,
    },
    'com.maskbook.ito:1': {
        pluginId: PluginId.ITO,
        icon: <ITOIcon />,
        messageParse: (body: any) => body.message.split(MSG_DELIMITER)[1],
    },
    'com.maskbook.ito:2': {
        pluginId: PluginId.ITO,
        icon: <ITOIcon />,
        messageParse: (body: any) => body.message.split(MSG_DELIMITER)[1],
    },
    'com.maskbook.poll:1': {
        pluginId: PluginId.Poll,
        icon: <PollIcon />,
        messageParse: (body: any) => body.question,
    },
}

interface PostHistoryRowProps {
    post: PostInformation
    network: string
}

export const PostHistoryRow = memo(({ post, network }: PostHistoryRowProps) => {
    const t = useDashboardI18N()
    const { openProfilePage } = PersonaContext.useContainer()

    const recipientClickHandler = useCallback(async (event: React.MouseEvent<HTMLSpanElement>, userId: string) => {
        event.stopPropagation()
        await openProfilePage(network, userId)
    }, [])

    const rowClickHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if ((event.target as HTMLElement).tagName !== 'A') {
            openWindow(post?.url, '_blank')
        }
    }, [])

    const postIcon = useMemo(() => {
        const { interestedMeta } = post
        const plugin = interestedMeta?.keys().next().value ?? 'text'

        return SUPPORT_PLUGIN[plugin]?.icon ?? <MessageIcon />
    }, [post.interestedMeta])

    const postMessage = useMemo(() => {
        const { interestedMeta } = post
        const meta = Array.from(interestedMeta ?? [])
        if (!meta.length) return null
        const [pluginName, pluginInfo] = meta[0]
        return SUPPORT_PLUGIN[pluginName]?.messageParse(pluginInfo) ?? ''
    }, [post.interestedMeta])

    const postOperation = useMemo(() => {
        const { identifier, interestedMeta } = post
        const meta = Array.from(interestedMeta ?? [])

        if (!meta.length) return null
        const pluginName = meta[0][0]
        const pluginId = SUPPORT_PLUGIN[pluginName]?.pluginId

        if (!pluginId) return null
        const handler = () => Services.SocialNetwork.openSNSAndActivatePlugin(`https://${identifier.network}`, pluginId)

        return (
            <Button color="secondary" variant="rounded" onClick={handler} sx={{ fontSize: 12 }}>
                {t.manage()}
            </Button>
        )
    }, [post.identifier])

    const allRecipients = useMemo(() => {
        const { recipients, postBy } = post
        if (recipients === 'everyone') return ['Everyone']
        const userIds = Array.from(recipients.keys()).map((x) => {
            return (
                <span key={x.userId} onClick={(e) => recipientClickHandler(e, x.userId)}>
                    @{x.userId}
                </span>
            )
        })
        return userIds.length
            ? userIds
            : [
                  <span key={postBy.userId} onClick={(e) => recipientClickHandler(e, postBy.userId)}>
                      Myself
                  </span>,
              ]
    }, [post.recipients, post.postBy])

    return (
        <PostHistoryRowUI
            operation={postOperation}
            message={postMessage}
            icon={postIcon}
            recipients={allRecipients}
            post={post}
            onClick={rowClickHandler}
        />
    )
})

interface PostHistoryRowUIProps {
    icon: ReactNode
    message?: ReactNode
    operation: ReactNode
    recipients: ReactNode[]
    post: PostInformation
    onClick(event: React.MouseEvent<HTMLElement>): void
}

const PostHistoryRowUI = memo<PostHistoryRowUIProps>(({ post, message, icon, operation, onClick, recipients }) => {
    const { classes } = useStyles()
    return (
        <Stack direction="row" gap={1.5} className={classes.hover}>
            <Stack
                justifyContent="center"
                alignItems="center"
                borderRadius="50%"
                width={48}
                height={48}
                sx={{ background: () => MaskColorVar.primary.alpha(0.1) }}>
                {icon}
            </Stack>
            <Stack flex={1} justifyContent="space-around" sx={{ cursor: 'pointer' }} gap={0.3} onClick={onClick}>
                <Typography component="p" variant="body2">
                    {(post.summary?.length ?? 0) > 40 ? post.summary!.slice(0, 40) + '...' : post.summary ?? ''}
                </Typography>
                <Typography component="p" variant="body2">
                    {message}
                </Typography>
                <Typography component="p" variant="body2" sx={{ color: (theme) => getMaskColor(theme).textSecondary }}>
                    {recipients.map((recipient, index) => (
                        <Typography key={index} component="span" variant="body2" sx={{ mr: 1 }}>
                            {recipient}
                        </Typography>
                    ))}
                </Typography>
            </Stack>
            <Box>{operation}</Box>
        </Stack>
    )
})
