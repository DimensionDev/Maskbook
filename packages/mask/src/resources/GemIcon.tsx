import { SvgIcon, SvgIconProps } from '@mui/material'
import type { FC } from 'react'

export const GemIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props} width="48" height="42" viewBox="0 0 48 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_bd_10764_2219)">
            <path
                d="M16.5481 6.82649L12.8045 10.5272C11.9792 11.3523 11.9792 12.6929 12.8045 13.5181L13.8468 14.5601L23.4129 6.20972H18.044C17.4834 6.20972 16.9453 6.43221 16.5481 6.82649Z"
                fill="url(#paint0_linear_10764_2219)"
            />
            <path
                d="M22.1829 6.20972L13.8477 14.5601L16.3829 17.0949L28.9744 6.20972H22.1829Z"
                fill="url(#paint1_linear_10764_2219)"
            />
            <path
                d="M27.2729 6.20949L16.3828 17.0946L18.9181 19.6293L32.58 8.02884L31.4756 6.92766C31.0334 6.46578 30.4194 6.20386 29.78 6.20386H27.2729V6.20949Z"
                fill="url(#paint2_linear_10764_2219)"
            />
            <path
                d="M31.5516 7.00073L18.918 19.6292L21.456 22.1667L34.6982 10.1494L31.5516 7.00073Z"
                fill="url(#paint3_linear_10764_2219)"
            />
            <path
                d="M22.4409 23.1525L21.4551 22.1668L34.1113 9.56372L35.1563 10.6086C35.9818 11.4338 36.0549 12.6927 35.2296 13.5179L25.5451 23.1553C24.686 24.0115 23.2973 24.0087 22.4409 23.1525Z"
                fill="url(#paint4_linear_10764_2219)"
            />
        </g>
        <defs>
            <filter
                id="filter0_bd_10764_2219"
                x="-4"
                y="-13"
                width="56"
                height="58"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="8" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_10764_2219" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="6" />
                <feGaussianBlur stdDeviation="6" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.784314 0 0 0 0 0.27451 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="effect1_backgroundBlur_10764_2219" result="effect2_dropShadow_10764_2219" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_10764_2219" result="shape" />
            </filter>
            <linearGradient
                id="paint0_linear_10764_2219"
                x1="12.1108"
                y1="14.3652"
                x2="17.8503"
                y2="8.62463"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#C774FF" />
                <stop offset="1" stopColor="#D677DB" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_10764_2219"
                x1="17.4869"
                y1="14.3349"
                x2="21.9297"
                y2="9.86104"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#EF7A9D" />
                <stop offset="1" stopColor="#D677DB" />
            </linearGradient>
            <linearGradient
                id="paint2_linear_10764_2219"
                x1="22.5302"
                y1="14.1433"
                x2="26.5787"
                y2="10.2954"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#EF7A9D" />
                <stop offset="1" stopColor="#FF936D" />
            </linearGradient>
            <linearGradient
                id="paint3_linear_10764_2219"
                x1="21.5716"
                y1="19.6853"
                x2="31.0985"
                y2="10.5201"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFC846" />
                <stop offset="1" stopColor="#FF936D" />
            </linearGradient>
            <linearGradient
                id="paint4_linear_10764_2219"
                x1="24.6636"
                y1="21.4786"
                x2="33.9245"
                y2="12.2958"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFC846" />
                <stop offset="1" stopColor="#FFC846" />
            </linearGradient>
        </defs>
    </SvgIcon>
)
