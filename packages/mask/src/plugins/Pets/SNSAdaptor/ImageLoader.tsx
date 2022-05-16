import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState, SyntheticEvent } from 'react'
import { DefaultIcon } from '../constants'

export function ImageLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [loaded, setLoaded] = useState(false)
    const onErrorHandle = (event: SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.src = DefaultIcon
    }
    return (
        <>
            <img
                {...props}
                onLoad={() => setLoaded(Boolean(props.src))}
                onError={onErrorHandle}
                style={{ display: loaded || !props.src ? 'block' : 'none' }}
            />
            {!loaded && Boolean(props.src) ? <CircularProgress size={20} /> : null}
        </>
    )
}
