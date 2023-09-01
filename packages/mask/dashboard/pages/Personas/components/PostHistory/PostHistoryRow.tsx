import { memo, type ReactNode, useCallback, useMemo } from 'react'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { getMaskColor, MaskColorVar, makeStyles } from '@masknet/theme'
import { type PostInformation, PluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import Services from '#services'
import { useDashboardI18N } from '../../../../locales/index.js'
import { PersonaContext } from '../../hooks/usePersonaContext.js'

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
    {
        pluginID: null | string
        icon: ReactNode
        messageParse: (body: any) => ReactNode
    }
> = {
    text: {
        pluginID: null,
        icon: <Icons.Message />,
        messageParse: () => null,
    },
    'com.maskbook.fileservice:1': {
        pluginID: null,
        icon: <Icons.FileMessage />,
        messageParse: parseFileServiceMessage,
    },
    'com.maskbook.fileservice:2': {
        pluginID: null,
        icon: <Icons.FileMessage />,
        messageParse: parseFileServiceMessage,
    },
    'com.maskbook.red_packet:1': {
        pluginID: PluginID.RedPacket,
        icon: <Icons.RedPacket />,
        messageParse: (body: any) => body.sender.message,
    },
    'com.maskbook.red_packet_nft:1': {
        pluginID: PluginID.RedPacket,
        icon: <Icons.NFTRedPacket />,
        messageParse: (body: { message: string }) => body.message,
    },
    'com.maskbook.ito:1': {
        pluginID: PluginID.ITO,
        icon: <Icons.ITO />,
        messageParse: (body: any) => body.message.split(MSG_DELIMITER)[1],
    },
    'com.maskbook.ito:2': {
        pluginID: PluginID.ITO,
        icon: <Icons.ITO />,
        messageParse: (body: any) => body.message.split(MSG_DELIMITER)[1],
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

        return SUPPORT_PLUGIN[plugin]?.icon ?? <Icons.Message />
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
        const pluginID = SUPPORT_PLUGIN[pluginName]?.pluginID

        if (!pluginID) return null
        const handler = () => Services.SiteAdaptor.openSiteAndActivatePlugin(`https://${identifier.network}`, pluginID)

        return (
            <Button color="secondary" variant="rounded" onClick={handler} sx={{ fontSize: 12 }}>
                {t.manage()}
            </Button>
        )
    }, [post.identifier])

    const allRecipients = useMemo(() => {
        const { recipients, postBy } = post
        if (recipients === 'everyone') return ['Everyone']

        const userIds = Array.from(recipients.keys()).map((x) => (
            <span key={x.userId} onClick={(e) => recipientClickHandler(e, x.userId)}>
                @{x.userId}
            </span>
        ))
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
