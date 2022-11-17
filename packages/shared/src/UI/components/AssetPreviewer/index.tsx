import { useTheme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Image } from '../Image/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    fallbackImage: {
        height: 64,
        width: 64,
    },
    icon: {
        position: 'absolute',
        top: theme.spacing(1.5),
        right: theme.spacing(1.5),
    },
}))

export interface AssetPreviewerProps extends withClasses<'root' | 'fallbackImage' | 'container'> {
    url?: string
    fallbackImage?: URL
    icon?: React.ReactNode
}

const ASSET_PLAYER_FALLBACK_DARK = new URL('../Image/mask-dark.png', import.meta.url)
const ASSET_PLAYER_FALLBACK_LIGHT = new URL('../Image/mask-light.png', import.meta.url)

export function AssetPreviewer(props: AssetPreviewerProps) {
    const { fallbackImage, url, icon } = props

    const { classes } = useStylesExtends(useStyles(), props)
    const theme = useTheme()

    return (
        <div className={classes.root}>
            <Image
                classes={{
                    fallbackImage: classes.fallbackImage,
                    container: classes.container,
                }}
                width="100%"
                height="100%"
                style={{ objectFit: 'cover' }}
                src={url}
                fallback={
                    fallbackImage ??
                    (theme.palette.mode === 'dark' ? ASSET_PLAYER_FALLBACK_DARK : ASSET_PLAYER_FALLBACK_LIGHT)
                }
            />
            <div className={classes.icon}>{icon}</div>
        </div>
    )
}
