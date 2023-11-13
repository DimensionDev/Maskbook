import { LoadingBase } from '@masknet/theme'
import { type ImgHTMLAttributes, useState, type SyntheticEvent } from 'react'
import { DefaultIcon } from '../constants.js'

export function ImageLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [loaded, setLoaded] = useState(false)
    const onErrorHandle = (event: SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.src = DefaultIcon
    }
    return (
        <>
            <img
                {...props}
                onLoad={() => setLoaded(!!props.src)}
                onError={onErrorHandle}
                style={{ display: loaded || !props.src ? 'block' : 'none' }}
            />
            {!loaded && !!props.src ?
                <LoadingBase size={20} />
            :   null}
        </>
    )
}
