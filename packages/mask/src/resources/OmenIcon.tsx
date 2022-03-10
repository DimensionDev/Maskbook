import { SvgIcon, SvgIconProps } from '@mui/material'
import type { FC } from 'react'

export const OmenIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 48 48"
        fill="none"
        height="22"
        width="22"
        version="1.1">
        <title>COMBO_token</title>
        <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="omen-icon" x1="24" x2="24" y2="48">
                <stop offset="0" stopColor="#1565C0" />
                <stop offset="1" stopColor="#1976D2" />
            </linearGradient>
        </defs>
        <path d="m0 24c0-13.255 10.745-24 24-24s24 10.745 24 24-10.745 24-24 24-24-10.745-24-24z" />

        <path
            clipRule="evenodd"
            d="m38.423 32.536c0.3647-0.1907 0.7563 0.2354 0.4877 0.5472-3.1201 3.6229-7.7407 5.9167-12.897 5.9167-9.3966 0-17.014-7.6174-17.014-17.014 0-5.1564 2.2938-9.777 5.9167-12.897 0.3118-0.26854 0.7379 0.12305 0.5473 0.48773-1.2309 2.354-1.9269 5.0319-1.9269 7.8724 0 9.3965 7.6174 17.014 17.014 17.014 2.8405 0 5.5183-0.6961 7.8724-1.9269zm-15.996-6.9637c-1.9933-1.9933-1.9933-5.2251 0-7.2184 2.4062-2.4061 11.429-5.0128 11.83-4.6117 0.401 0.401-2.2056 9.424-4.6118 11.83-0.979 0.979-2.2567 1.4772-3.5397 1.4945-1.3293 0.018-2.6644-0.4802-3.6787-1.4945z"
            fill="#fff"
            fillRule="evenodd"
        />
    </SvgIcon>
)
