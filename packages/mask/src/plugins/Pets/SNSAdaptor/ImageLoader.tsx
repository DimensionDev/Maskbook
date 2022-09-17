import { LoadingBase } from '@masknet/theme'
import { ImgHTMLAttributes, useState, SyntheticEvent } from 'react'
import { DefaultIcon } from '../constants.js'

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
            {!loaded && Boolean(props.src) ? <LoadingBase size={20} /> : null}
        </>
    )
}
