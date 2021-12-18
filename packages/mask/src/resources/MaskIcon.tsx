/**
 * This icon should be sync with https://mask.io/img/MB--CircleCanvas--WhiteOverBlue.svg
 */
import { SvgIcon, SvgIconProps, useTheme } from '@mui/material'

const MaskSmileFaceSVG = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <circle cx="300" cy="300" r="300" fill="#1C68F3" />
        <path
            fill="#fff"
            d="m480 200h-360v-44c0-19.882 16.118-36 36-36h288c19.882 0 36 16.118 36 36v44zm0 30v100h-60-231-21.912c13.661 60.677 67.878 106 132.68 106 53.575 0 99.914-30.978 122.08-76h58.144v84c0 19.882-16.118 36-36 36h-288c-19.882 0-36-16.118-36-36v-214h360zm-267.78 130l175.11 5e-6c-19.092 27.914-51.184 46.232-87.555 46.232s-68.463-18.318-87.555-46.232zm-44.65-58h30.687c3.3742-10.445 13.178-18 24.746-18s21.372 7.5549 24.746 18h30.687c-3.8818-27.138-27.221-48-55.433-48s-51.551 20.862-55.433 48zm154 0h30.687c3.3742-10.445 13.178-18 24.746-18s21.372 7.5549 24.746 18h30.687c-3.8818-27.138-27.221-48-55.433-48s-51.551 20.862-55.433 48z"
        />
    </svg>
)

const MaskSmileFaceSharpSVG = ({ size = 19 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.8 0H34.2C36.2987 0 38 1.70132 38 3.8V34.2C38 36.2987 36.2987 38 34.2 38H3.8C1.70132 38 0 36.2987 0 34.2V3.8C0 1.70132 1.70132 0 3.8 0ZM35.0939 21.6824V12.7412H2.90569V31.8753C2.90569 33.653 4.34681 35.0941 6.12451 35.0941H31.8751C33.6528 35.0941 35.0939 33.653 35.0939 31.8753V24.3648L29.8951 24.3649C27.9129 28.3903 23.7696 31.16 18.9795 31.16C13.1854 31.16 8.3378 27.1076 7.11632 21.6825L8.2704 21.6825V21.6824H35.0939ZM18.9795 28.4984C22.2314 28.4984 25.1008 26.8606 26.8078 24.3649H11.1511C12.8581 26.8606 15.7275 28.4984 18.9795 28.4984ZM7.15874 19.1789C7.50581 16.7524 9.59263 14.8871 12.1151 14.8871C14.6376 14.8871 16.7244 16.7524 17.0715 19.1789L14.3277 19.1789C14.026 18.245 13.1494 17.5694 12.1151 17.5694C11.0808 17.5694 10.2042 18.245 9.9025 19.1789L7.15874 19.1789ZM20.9282 19.1789C21.2752 16.7524 23.362 14.8871 25.8845 14.8871C28.407 14.8871 30.4938 16.7524 30.8409 19.1789L28.0971 19.1789C27.7954 18.245 26.9189 17.5694 25.8845 17.5694C24.8502 17.5694 23.9736 18.245 23.6719 19.1789L20.9282 19.1789ZM35.0939 6.12473C35.0939 4.34702 33.6528 2.90591 31.8751 2.90591H6.12451C4.34681 2.90591 2.90569 4.34702 2.90569 6.12473V10.0588H35.0939V6.12473Z"
        />
    </svg>
)

const WalletSharpSVG = ({ size }: { size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-alert-circle">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="14" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

const MaskFilledSVG = (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26Z"
            fill="#0F1419"
        />
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M20.8466 9.8044V14.1215H7.68749L7.12132 14.1216C7.72056 16.7411 10.0987 18.6977 12.9412 18.6977C15.2911 18.6977 17.3237 17.3604 18.2961 15.4168L20.8466 15.4167V19.0431C20.8466 19.9014 20.1396 20.5973 19.2675 20.5973H6.63476C5.76265 20.5973 5.05566 19.9014 5.05566 19.0431V9.8044H20.8466ZM16.7816 15.4168C15.9442 16.6218 14.5365 17.4126 12.9412 17.4126C11.3458 17.4126 9.93816 16.6218 9.10072 15.4168H16.7816ZM9.57363 10.8405C8.33615 10.8405 7.3124 11.7411 7.14213 12.9128L8.48817 12.9128C8.63617 12.4618 9.0662 12.1357 9.57363 12.1357C10.0811 12.1357 10.5111 12.4618 10.6591 12.9128L12.0051 12.9128C11.8349 11.7411 10.8111 10.8405 9.57363 10.8405ZM16.3287 10.8405C15.0912 10.8405 14.0674 11.7411 13.8972 12.9128L15.2432 12.9128C15.3912 12.4618 15.8212 12.1357 16.3287 12.1357C16.8361 12.1357 17.2661 12.4618 17.4141 12.9128L18.7601 12.9128C18.5899 11.7411 17.5661 10.8405 16.3287 10.8405ZM19.2675 5.05554C20.1396 5.05554 20.8466 5.75137 20.8466 6.60971V8.50926H5.05566V6.60971C5.05566 5.75137 5.76265 5.05554 6.63476 5.05554H19.2675Z"
            fill="white"
        />
    </svg>
)

const MaskSmileFaceOutlinedSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 42 42">
        <path stroke="#fff" strokeWidth="3" d="M39.55 21a18.55 18.55 0 11-37.1 0 18.55 18.55 0 0137.1 0z" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M32.45 16.55v6.36H12.54a8.66 8.66 0 0016.21 1.9h3.7v5.35a2.3 2.3 0 01-2.29 2.3H11.84a2.3 2.3 0 01-2.3-2.3V16.55h22.91zm-5.9 8.27a6.74 6.74 0 01-11.14 0h11.15zM16.1 18.07a3.56 3.56 0 00-3.53 3.06h1.96a1.66 1.66 0 013.14 0h1.96a3.56 3.56 0 00-3.53-3.06zm9.8 0a3.56 3.56 0 00-3.53 3.06h1.96a1.66 1.66 0 013.14 0h1.96a3.56 3.56 0 00-3.53-3.06zm4.26-8.52a2.3 2.3 0 012.3 2.29v2.8H9.54v-2.8a2.3 2.3 0 012.29-2.3h18.32z"
            clipRule="evenodd"
        />
    </svg>
)

const MaskTextSVG = (
    <svg viewBox="0 0 80 20">
        <path
            d="m18.902 25.67h1.82v18.33h-3.744v-10.14l-5.668 7.956-5.694-7.956v10.14h-3.718v-18.33h1.82l7.592 10.504zm15.912 4.212h3.614v14.118h-3.614v-1.04c-1.17.78-2.574 1.248-4.134 1.248-4.42 0-7.02-3.562-7.02-7.306 0-3.77 2.6-7.306 7.02-7.306 1.482 0 2.938.468 4.134 1.17zm0 9.88v-5.668c-.884-.754-2.132-1.222-3.484-1.222-2.574 0-4.186 1.924-4.186 4.03 0 2.132 1.638 4.056 4.186 4.056 1.378 0 2.6-.442 3.484-1.196zm6.084 3.094 1.352-2.678c1.742.754 3.068 1.144 4.836 1.144 1.664 0 2.314-.624 2.314-1.352 0-.806-.806-1.17-2.99-1.638-3.042-.676-5.252-1.664-5.252-4.394 0-2.548 2.106-4.316 5.382-4.316 2.21 0 3.978.52 5.512 1.144l-1.196 2.652c-1.378-.52-2.99-.91-4.394-.91-1.378 0-2.08.494-2.08 1.248 0 .78.858 1.144 3.12 1.612 3.276.676 5.174 1.82 5.174 4.394 0 2.678-2.054 4.446-5.668 4.446-2.444 0-4.03-.338-6.11-1.352zm23.062-7.462 5.226 8.606h-4.004l-3.614-5.772-2.73 2.626v3.146h-3.614v-19.604h3.614v11.544l6.032-6.058h4.238z"
            fill="currentColor"
            transform="translate(0 -24)"
        />
    </svg>
)

export function MaskTextIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{MaskTextSVG}</SvgIcon>
}

export function MaskIcon(props: SvgIconPropsWithSize) {
    const { size = 24 } = props
    return (
        <SvgIcon style={{ width: size, height: size }} {...props} viewBox={`0 0 ${size} ${size}`}>
            <MaskSmileFaceSVG size={props.size} />
        </SvgIcon>
    )
}

export function MaskIconOutlined(props: SvgIconProps) {
    return <SvgIcon {...props}>{MaskSmileFaceOutlinedSVG}</SvgIcon>
}

export function MaskSharpIcon(props: SvgIconProps) {
    return (
        <SvgIcon style={{ transform: 'translate(2px, 2px)', width: 20, height: 20 }} {...props}>
            <MaskSmileFaceSharpSVG />
        </SvgIcon>
    )
}

export function MaskSharpIconOfSize(props: SvgIconPropsWithSize) {
    return (
        <SvgIcon {...props}>
            <MaskSmileFaceSharpSVG size={props.size} />
        </SvgIcon>
    )
}
export function WalletSharp(props: SvgIconPropsWithSize) {
    const { size = 20 } = props
    return (
        <SvgIcon {...props} style={{ width: size, height: size }}>
            <WalletSharpSVG size={size} />
        </SvgIcon>
    )
}

export function MaskFilledIcon(props: { size: number }) {
    const theme = useTheme()
    const icon = new URL('./maskFilledIcon.png', import.meta.url).toString()
    const icon_dark = new URL('./maskFilledIconDark.png', import.meta.url).toString()
    return (
        <img
            src={theme.palette.mode === 'light' ? icon : icon_dark}
            style={{ width: props.size, height: props.size }}
        />
    )
}

interface SvgIconPropsWithSize extends SvgIconProps {
    size?: number
}
