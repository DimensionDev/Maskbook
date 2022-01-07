import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState } from 'react'

export function ImgLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [loaded, setLoaded] = useState(false)
    const defaultIcon = new URL('../assets/defaultIcon.png', import.meta.url).toString()
    const onErrorHandle = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = defaultIcon
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
