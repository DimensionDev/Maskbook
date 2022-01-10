import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState, SyntheticEvent } from 'react'

export function ImageLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [loaded, setLoaded] = useState(false)
    const defaultIcon = new URL('../assets/defaultIcon.png', import.meta.url).toString()
    const onErrorHandle = (event: SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.src = defaultIcon
    }
    return (
        <>
            <img
                {...props}
                onLoad={() => setLoaded(Boolean(props.src))}
                onError={onErrorHandle}
                style={{ display: loaded || !Boolean(props.src) ? 'block' : 'none' }}
            />
            {!loaded && Boolean(props.src) ? <CircularProgress size={20} /> : null}
        </>
    )
}
