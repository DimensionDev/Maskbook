import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
        <path fill="#000" d="M33 44c23-23 59-23 82 0l19 19-19 19a58 58 0 0 1-82 0L14 63l19-19Z" />
        <path
            fill="#0CE466"
            fillRule="evenodd"
            d="m0 63 44-44h60l44 44-74 74L0 63Zm108-16a48 48 0 0 0-68 0L24 63l16 16c19 19 49 19 68 0l16-16-16-16Z"
            clipRule="evenodd"
        />
        <path fill="#000" d="M74 77a14 14 0 1 1 0-28 14 14 0 0 1 0 28Z" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M51 63a23 23 0 1 0 46 0 23 23 0 0 0-46 0Zm13 0a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z"
            clipRule="evenodd"
        />
    </svg>
)

export function LooksRareIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
