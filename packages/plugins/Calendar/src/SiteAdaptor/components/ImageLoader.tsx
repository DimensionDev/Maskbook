import { LoadingBase, makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { Box } from '@mui/material'

interface ImageLoaderProps {
    src: string
}

const MASK_FALLBACK = new URL('../assets/mask.svg', import.meta.url).href

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        height: '156px',
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
        height: '156px',
        objectFit: 'cover',
    },
}))

export function ImageLoader({ src }: ImageLoaderProps) {
    const [loaded, setLoaded] = useState(false)
    const [failed, setFailed] = useState(false)
    const { classes } = useStyles()
    console.log(failed, loaded)
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
            :   <img src={MASK_FALLBACK} width={60} height={60} />}
            {!loaded && !failed ?
                <Box position="absolute" top="calc(50% - 10px)" left="calc(50% - 10px)">
                    <LoadingBase size={20} />
                </Box>
            :   null}
        </div>
    )
}
