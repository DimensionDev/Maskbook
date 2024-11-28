import { LoadingBase, makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { Box, useTheme } from '@mui/material'

const MASK_DARK_FALLBACK = new URL('../assets/mask.dark.svg', import.meta.url).href
const MASK_LIGHT_FALLBACK = new URL('../assets/mask.light.svg', import.meta.url).href

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        minHeight: '156px',
        display: 'flex',
        borderRadius: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.bg,
        position: 'relative',
    },
    poster: {
        borderRadius: '8px',
        width: '100%',
        objectFit: 'cover',
    },
    iconContainer: {
        position: 'absolute',
        inset: '0',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
}))

interface ImageLoaderProps {
    src: string
}
export function ImageLoader({ src }: ImageLoaderProps) {
    const [loaded, setLoaded] = useState(false)
    const [failed, setFailed] = useState(false)
    const { classes } = useStyles()
    const theme = useTheme()

    return (
        <div className={classes.container}>
            {!failed ?
                <img
                    src={src}
                    className={classes.poster}
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        setFailed(true)
                    }}
                />
            :   <img
                    src={theme.palette.mode === 'light' ? MASK_LIGHT_FALLBACK : MASK_DARK_FALLBACK}
                    width={60}
                    height={60}
                />
            }
            {!loaded && !failed ?
                <Box className={classes.iconContainer}>
                    <LoadingBase size={20} />
                </Box>
            :   null}
        </div>
    )
}
