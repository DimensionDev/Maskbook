import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState } from 'react'

export function ImgLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [loaded, setLoaded] = useState(false)

    return (
        <>
            <img {...props} onLoad={() => setLoaded(true)} style={{ display: loaded ? 'block' : 'none' }} />
            {!loaded ? <CircularProgress size={20} /> : null}
        </>
    )
}
