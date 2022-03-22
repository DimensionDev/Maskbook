import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg width="30" height="30" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M0.943359 13.2631C0.943359 20.5774 6.88707 26.5261 14.1951 26.5261C21.5032 26.5261 27.4469 20.5774 27.4469 13.2631C27.4402 5.94887 21.4964 0.00012207 14.1951 0.00012207C6.88707 0.00012207 0.943359 5.94887 0.943359 13.2631Z"
            fill="url(#paint0_radial)"
        />
        <path
            d="M0.943359 13.2631C0.943359 20.5774 6.88707 26.5261 14.1951 26.5261C21.5032 26.5261 27.4469 20.5774 27.4469 13.2631C27.4402 5.94887 21.4964 0.00012207 14.1951 0.00012207C6.88707 0.00012207 0.943359 5.94887 0.943359 13.2631Z"
            fill="url(#paint1_radial)"
        />
        <path
            d="M0.943359 13.2631C0.943359 20.5774 6.88707 26.5261 14.1951 26.5261C21.5032 26.5261 27.4469 20.5774 27.4469 13.2631C27.4402 5.94887 21.4964 0.00012207 14.1951 0.00012207C6.88707 0.00012207 0.943359 5.94887 0.943359 13.2631Z"
            fill="url(#paint2_radial)"
        />
        <defs>
            <radialGradient
                id="paint0_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(18.1597 6.46118) scale(19.9547 19.9716)">
                <stop offset="0.00520833" stopColor="white" />
                <stop offset="0.458333" stopColor="#B7D8C8" />
                <stop offset="0.65625" stopColor="#6D9487" />
                <stop offset="1" stopColor="#4B4C3C" />
            </radialGradient>
            <radialGradient
                id="paint1_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(18.1597 6.46118) scale(19.9547 19.9716)">
                <stop offset="0.00520833" stopColor="white" />
                <stop offset="0.458333" stopColor="#B5B4C6" />
                <stop offset="0.65625" stopColor="#9B8F8F" />
                <stop offset="1" stopColor="#4B4C3C" />
            </radialGradient>
            <radialGradient
                id="paint2_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(18.1597 6.46118) scale(19.9547 19.9716)">
                <stop offset="0.15625" stopColor="#DCC8D0" />
                <stop offset="0.302083" stopColor="#78C8CF" />
                <stop offset="0.427083" stopColor="#4D959E" />
                <stop offset="0.557292" stopColor="#305EB9" />
                <stop offset="0.796875" stopColor="#311F12" />
                <stop offset="0.90625" stopColor="#684232" />
                <stop offset="1" stopColor="#2D1C13" />
            </radialGradient>
        </defs>
    </svg>
)

export function ZoraIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
