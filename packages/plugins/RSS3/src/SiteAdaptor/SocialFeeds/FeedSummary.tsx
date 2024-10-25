import { Select, Trans } from '@lingui/macro'
import type { Social } from '@masknet/web3-providers/types'
import { Typography, type TypographyProps } from '@mui/material'
import { memo } from 'react'
import { Label } from '../components/common.js'
import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles<{ size: number }>()((theme, { size }) => ({
    summary: {
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
    },
    container: {
        display: 'inline-block !important',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
    },
    fallbackImage: {
        width: size,
        height: size,
    },
}))
interface AvatarProps {
    url?: string
    size?: number
}
function Avatar({ url, size = 20 }: AvatarProps) {
    const { classes } = useStyles({ size })
    return (
        <Image
            classes={{
                container: classes.container,
                fallbackImage: classes.fallbackImage,
            }}
            width={size}
            height={size}
            src={url}
        />
    )
}

interface Props extends TypographyProps {
    post: Social.Post
}
export const FeedSummary = memo<Props>(function FeedSummary({ post, ...rest }) {
    const { classes, cx } = useStyles({ size: 20 })
    const handle = post.author.handle
    const pfp = post.author.pfp

    return (
        <Typography {...rest} className={cx(classes.summary, rest.className)}>
            <Select
                value={post.type}
                _Post={
                    <Trans>
                        <Avatar url={pfp} />
                        <Label>{handle}</Label> published a post on <Label>{post.source}</Label>
                    </Trans>
                }
                _Comment={
                    <Trans>
                        <Avatar url={pfp} />
                        <Label>{handle}</Label> made a comment on <Label>{post.source}</Label>
                    </Trans>
                }
                _Mirror={
                    <Trans>
                        <Avatar url={post.reporter?.pfp} />
                        <Label>{post.reporter?.handle}</Label> mirrored a post post by
                        <Avatar url={pfp} />
                        <Label>{handle}</Label> on <Label>{post.source}</Label>
                    </Trans>
                }
                _Quote={
                    <Trans>
                        <Avatar url={pfp} />
                        <Label>{handle}</Label> quoted a post post on <Label>{post.source}</Label>
                    </Trans>
                }
                other={
                    <Trans>
                        <Avatar url={pfp} />
                        <Label>{handle}</Label> post stuff on <Label>{post.source}</Label>
                    </Trans>
                }
            />
        </Typography>
    )
})
