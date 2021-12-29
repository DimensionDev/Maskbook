import { CircularProgress } from '@mui/material'
import { ImgHTMLAttributes, useState } from 'react'

export function ImgLoader(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { children, className, ...other } = props
    const [imgLoad, setImgLoad] = useState(false)

    return (
        <>
            <img
                {...other}
                className={className}
                onLoad={() => setImgLoad(true)}
                style={{ display: imgLoad ? 'block' : 'none' }}
            />
            {!imgLoad ? <CircularProgress size={20} /> : null}
        </>
    )
}
