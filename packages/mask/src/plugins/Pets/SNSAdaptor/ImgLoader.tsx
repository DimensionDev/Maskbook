import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState } from 'react'

export function ImgLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const [imgLoad, setImgLoad] = useState(false)

    return (
        <>
            <img {...props} onLoad={() => setImgLoad(true)} style={{ display: imgLoad ? 'block' : 'none' }} />
            {!imgLoad ? <CircularProgress size={20} /> : null}
        </>
    )
}
