import { SvgIcon, SvgIconProps } from '@mui/material'

const svg = (
    <svg width="115" height="45" viewBox="0 0 115 45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_bd_876_5883)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 4.40259C6 2.19345 7.79086 0.402588 10 0.402588H105C107.209 0.402588 109 2.19345 109 4.40259C109 6.61173 107.209 8.40259 105 8.40259H10C7.79086 8.40259 6 6.61173 6 4.40259ZM6 16.4026C6 14.1934 7.79086 12.4026 10 12.4026H70C72.2091 12.4026 74 14.1934 74 16.4026C74 18.6117 72.2091 20.4026 70 20.4026H10C7.79086 20.4026 6 18.6117 6 16.4026ZM10 24.4026C7.79086 24.4026 6 26.1934 6 28.4026C6 30.6117 7.79086 32.4026 10 32.4026H51C53.2091 32.4026 55 30.6117 55 28.4026C55 26.1934 53.2091 24.4026 51 24.4026H10Z"
                fill="white"
                fillOpacity="0.3"
                shapeRendering="crispEdges"
            />
        </g>
        <defs>
            <filter
                id="filter0_bd_876_5883"
                x="-10"
                y="-15.5974"
                width="135"
                height="64"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="8" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_876_5883" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="6" />
                <feGaussianBlur stdDeviation="3" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                <feBlend mode="normal" in2="effect1_backgroundBlur_876_5883" result="effect2_dropShadow_876_5883" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_876_5883" result="shape" />
            </filter>
        </defs>
    </svg>
)

export const FrameIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>
