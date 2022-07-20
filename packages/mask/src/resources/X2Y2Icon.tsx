import { SvgIcon, SvgIconProps } from '@mui/material'
import type { FC } from 'react'

export const X2Y2Icon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_bd_10764_2226)">
            <path
                d="M36 18C36 11.3726 30.6274 6 24 6C17.3726 6 12 11.3726 12 18C12 24.6274 17.3726 30 24 30C30.6274 30 36 24.6274 36 18Z"
                fill="white"
            />
            <path
                d="M31.6229 12.1633C30.1518 10.7259 28.1396 9.84002 25.9204 9.84002C21.4137 9.84002 17.7604 13.4934 17.7604 18C17.7604 22.5067 21.4137 26.16 25.9204 26.16C28.1396 26.16 30.1518 25.2742 31.6229 23.8368C29.8682 26.1248 27.1065 27.6 24.0004 27.6C18.6984 27.6 14.4004 23.302 14.4004 18C14.4004 12.6981 18.6984 8.40002 24.0004 8.40002C27.1065 8.40002 29.8682 9.87524 31.6229 12.1633Z"
                fill="url(#paint0_linear_10764_2226)"
            />
            <path
                d="M19.8223 22.6694C20.9991 23.8193 22.6089 24.5279 24.3842 24.5279C27.9896 24.5279 30.9122 21.6053 30.9122 17.9999C30.9122 14.3946 27.9896 11.4719 24.3842 11.4719C22.6089 11.4719 20.9991 12.1806 19.8223 13.3305C21.226 11.5001 23.4353 10.3199 25.9202 10.3199C30.1618 10.3199 33.6002 13.7584 33.6002 17.9999C33.6002 22.2415 30.1618 25.6799 25.9202 25.6799C23.4353 25.6799 21.226 24.4997 19.8223 22.6694Z"
                fill="url(#paint1_linear_10764_2226)"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M29.7602 18C29.7602 21.1811 27.1814 23.76 24.0002 23.76C20.8191 23.76 18.2402 21.1811 18.2402 18C18.2402 14.8189 20.8191 12.24 24.0002 12.24C27.1814 12.24 29.7602 14.8189 29.7602 18ZM27.8402 18C27.8402 20.1208 26.121 21.84 24.0002 21.84C21.8795 21.84 20.1602 20.1208 20.1602 18C20.1602 15.8792 21.8795 14.16 24.0002 14.16C26.121 14.16 27.8402 15.8792 27.8402 18Z"
                fill="url(#paint2_linear_10764_2226)"
            />
        </g>
        <defs>
            <filter
                id="filter0_bd_10764_2226"
                x="-4"
                y="-10"
                width="56"
                height="58"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="8" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_10764_2226" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="6" />
                <feGaussianBlur stdDeviation="6" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.878431 0 0 0 0 1 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="effect1_backgroundBlur_10764_2226" result="effect2_dropShadow_10764_2226" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_10764_2226" result="shape" />
            </filter>
            <linearGradient
                id="paint0_linear_10764_2226"
                x1="14.4004"
                y1="17.669"
                x2="33.6004"
                y2="17.669"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#00E0FF" />
                <stop offset="1" stopColor="#562EC8" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_10764_2226"
                x1="14.4003"
                y1="17.6689"
                x2="33.6002"
                y2="17.6689"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#00E0FF" />
                <stop offset="1" stopColor="#562EC8" />
            </linearGradient>
            <linearGradient
                id="paint2_linear_10764_2226"
                x1="14.4002"
                y1="17.669"
                x2="33.6002"
                y2="17.669"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#00E0FF" />
                <stop offset="1" stopColor="#562EC8" />
            </linearGradient>
        </defs>
    </SvgIcon>
)
