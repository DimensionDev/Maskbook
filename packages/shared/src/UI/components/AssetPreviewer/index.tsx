import { makeStyles } from '@masknet/theme'
import { Image } from '../Image/index.js'
import type { JSX } from 'react'

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
        top: theme.spacing(0.5),
        left: theme.spacing(0.5),
    },
}))

export interface AssetPreviewerProps extends withClasses<'root' | 'fallbackImage' | 'container'> {
    url?: string
    fallbackImage?: JSX.Element | string
    icon?: React.ReactNode
}

export function AssetPreviewer(props: AssetPreviewerProps) {
    const { fallbackImage, url, icon } = props

    const { classes } = useStyles(undefined, { props })

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
                fallback={fallbackImage}
            />
            {icon ?
                <div className={classes.icon}>{icon}</div>
            :   null}
        </div>
    )
}
