import { memo } from 'react'

interface Props {
    fill?: string
    width?: string | number
    height?: string | number
}

export default memo<Props>(({ fill = '#000', width, height }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width={width} height={height} viewBox="0 0 16 16">
        <path
            fill={fill}
            d="M10.9 13.96a.53.53 0 01-.54-.54v-3.3c0-.3.23-.53.54-.53.3 0 .54.23.54.54v3.3c0 .3-.23.53-.54.53z"
        />
        <path
            fill={fill}
            d="M12.56 12.3h-3.3a.53.53 0 01-.54-.53c0-.31.23-.54.54-.54h3.3c.3 0 .54.23.54.54 0 .3-.24.54-.54.54z"
        />
        <path
            fill={fill}
            d="M12.14 7.71V3.75a.56.56 0 00-.16-.4L8.56.15A.58.58 0 008.18 0H1.77c-.5 0-.9.4-.9.9v12.45c0 .5.4.9.9.9h5.7a4.22 4.22 0 007.67-2.48 4.25 4.25 0 00-3-4.06zM8.72 1.78l1.51 1.43h-1.5V1.78zm-6.77 11.4V1.07h5.69v2.67c0 .3.23.54.54.54h2.88v3.24h-.16a4.23 4.23 0 00-4 5.64H1.95zm8.95 1.74a3.17 3.17 0 01-3.15-3.15A3.17 3.17 0 0110.9 8.6a3.17 3.17 0 013.15 3.16 3.17 3.17 0 01-3.15 3.15z"
        />
    </svg>
))
