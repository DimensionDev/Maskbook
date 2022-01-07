import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState } from 'react'

export function ImgLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [loaded, setLoaded] = useState(false)

    return (
        <>
            <img
                {...props}
                onLoad={() => setLoaded(Boolean(props.src))}
                style={{ display: loaded || !Boolean(props.src) ? 'block' : 'none' }}
            />
            {!loaded && Boolean(props.src) ? <CircularProgress size={20} /> : null}
        </>
    )
}
