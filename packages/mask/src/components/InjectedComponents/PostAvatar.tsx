import { useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import { Link } from '@mui/material'
import { useCashAnchorEnhancer } from '../../../shared-ui/TypedMessageRender/Components/Text.js'

const useStyles = makeStyles()((theme) => ({
    avatar: {
        width: 44,
        marginTop: '2px',
        marginLeft: '2px',
    },
}))

interface PostAvatarProps {
    zipAvatar?(): void
    unzipAvatar?(): void
    avatar?: string | null
    href?: string | null
}

export function PostAvatar(props: PostAvatarProps) {
    const { classes } = useStyles()

    const { zipAvatar, unzipAvatar, avatar, href } = props
    const { onMouseEnter } = useCashAnchorEnhancer('nftProject', href ? href.replace(/^\//, '') : '')
    useEffect(() => {
        if (avatar && href) {
            zipAvatar?.()
        } else {
            unzipAvatar?.()
        }

        return () => unzipAvatar?.()
    }, [zipAvatar, unzipAvatar, avatar, href])

    return (
        <Link href={href ?? ''} onMouseEnter={onMouseEnter}>
            <img src={avatar ?? ''} className={classes.avatar} />
        </Link>
    )
}
