import { SvgIcon, SvgIconProps } from '@mui/material'

export const TrustIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" rx="24" fill="#3375BB" />
            <path
                fillRule="evenodd"
                clip-rule="evenodd"
                d="M96.685 31.485c1.149 0 2.236.472 3.036 1.272a4.29 4.29 0 011.23 3.056c-.205 12.223-.676 21.575-1.558 28.98-.862 7.403-2.154 12.9-4.102 17.35-1.313 2.974-2.933 5.435-4.84 7.527-2.564 2.769-5.497 4.778-8.696 6.686-1.368.818-2.79 1.625-4.282 2.473-3.183 1.807-6.683 3.795-10.649 6.448a4.242 4.242 0 01-4.737 0c-4.027-2.684-7.573-4.696-10.785-6.519-.714-.405-1.412-.8-2.095-1.192-3.753-2.174-7.137-4.246-10.09-7.24-1.97-1.969-3.671-4.369-5.025-7.22-1.846-3.814-3.097-8.428-4.02-14.397-1.23-7.978-1.846-18.417-2.071-32.896a4.274 4.274 0 011.21-3.056 4.35 4.35 0 013.056-1.272h1.763c5.435.021 17.433-.512 27.81-8.593a4.278 4.278 0 015.23 0c10.378 8.08 22.376 8.614 27.831 8.593h1.784zm-9.536 47.93c1.333-2.748 2.44-6.542 3.281-11.998 1.005-6.522 1.62-15.382 1.908-27.44-6.4-.185-17.392-1.416-27.872-8.47-10.48 7.034-21.473 8.264-27.851 8.47.225 9.967.676 17.72 1.394 23.81.82 6.932 1.99 11.629 3.446 14.93.964 2.195 2.03 3.775 3.302 5.169 1.702 1.867 3.855 3.405 6.788 5.168 1.217.73 2.558 1.49 4.018 2.316 2.601 1.472 5.58 3.158 8.903 5.273 3.262-2.08 6.197-3.749 8.768-5.21.775-.44 1.517-.863 2.225-1.271 3.61-2.072 6.275-3.794 8.265-5.804 1.333-1.374 2.42-2.871 3.425-4.943z"
                fill="#fff"
            />
        </svg>
    </SvgIcon>
)

export const IMTokenIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" rx="24" fill="url(#paint0_linear)" />
            <path
                d="M105.782 36.041c2.77 37.67-21.348 55.475-42.97 57.374-20.1 1.765-39.022-10.636-40.681-29.69-1.37-15.74 8.32-22.441 15.933-23.11 7.83-.689 14.41 4.733 14.982 11.297.55 6.311-3.373 9.184-6.1 9.423-2.158.19-4.872-1.125-5.117-3.948-.21-2.426.707-2.757.483-5.334-.399-4.588-4.384-5.123-6.566-4.933-2.64.232-7.431 3.326-6.759 11.033.676 7.774 8.1 13.916 17.832 13.062 10.503-.921 17.815-9.131 18.364-20.646a4.2 4.2 0 01.375-1.768l.004-.014c.113-.242.245-.473.395-.693a9.37 9.37 0 01.883-1.118c.004-.01.004-.01.01-.01.27-.306.596-.637.964-.992 4.587-4.346 21.11-14.595 36.735-11.35a1.565 1.565 0 011.233 1.417z"
                fill="#fff"
            />
            <defs>
                <linearGradient id="paint0_linear" x1="128" y1="54.5" x2="0" y2="55" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#11C3D1" />
                    <stop offset="1" stopColor="#057EB8" />
                </linearGradient>
            </defs>
        </svg>
    </SvgIcon>
)

export const RainbowIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="128" height="128" fill="url(#paint0_linear)" rx="24" />
            <path
                fill="url(#paint1_radial)"
                d="M72.527 100.659c0-24.87-20.072-45.034-44.83-45.034H22v11.09c0 3.162 2.55 5.723 5.696 5.723 15.515 0 28.094 12.636 28.094 28.221 0 2.951 2.382 5.341 5.317 5.341h11.42v-5.341z"
            />
            <path
                fill="url(#paint2_radial)"
                d="M89.263 100.659c0-34.103-27.618-61.846-61.567-61.846H22v16.812h5.696c24.72 0 44.83 20.203 44.83 45.034V106h16.737v-5.341z"
            />
            <path
                fill="url(#paint3_radial)"
                d="M27.696 38.813c34.003 0 61.567 27.69 61.567 61.846V106h11.42c2.938 0 5.317-2.39 5.317-5.341 0-21.01-8.144-40.765-22.935-55.62C68.277 30.181 48.61 22 27.696 22 24.55 22 22 24.56 22 27.722v11.09h5.696z"
            />
            <defs>
                <radialGradient
                    id="paint1_radial"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(35.56535 -34.37578 34.64161 35.84038 23.943 103.361)"
                    gradientUnits="userSpaceOnUse">
                    <stop offset=".662" stopColor="#01B1E2" />
                    <stop offset="1" stopColor="#01D64F" />
                </radialGradient>
                <radialGradient
                    id="paint2_radial"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="rotate(-44.956 139.17 26.446) scale(69.6855 70.0822)"
                    gradientUnits="userSpaceOnUse">
                    <stop offset=".76" stopColor="#FE0" />
                    <stop offset=".973" stopColor="#FFA000" />
                </radialGradient>
                <radialGradient
                    id="paint3_radial"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(61.26799 -59.14432 59.4229 61.55657 22 106.063)"
                    gradientUnits="userSpaceOnUse">
                    <stop offset=".81" stopColor="#EE3E1D" />
                    <stop offset="1" stopColor="#8854C4" />
                </radialGradient>
                <linearGradient id="paint0_linear" x1="64" x2="64" y1="0" y2="128" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#164299" />
                    <stop offset="1" stopColor="#001E59" />
                </linearGradient>
            </defs>
        </svg>
    </SvgIcon>
)

export const MetaMaskIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128">
            <rect width="128" height="128" fill="#fff" rx="24" />
            <path
                fill="#E17726"
                stroke="#E17726"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M99.85 28L69.09 50.81l5.72-13.44L99.85 28z"
            />
            <path
                fill="#E27625"
                stroke="#E27625"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M28.9 28l30.48 23.03-5.44-13.66L28.9 28zM88.78 80.9l-8.19 12.53 17.53 4.83 5.02-17.1-14.36-.27zM25.65 81.17l4.99 17.1 17.5-4.84-8.16-12.54-14.33.28z"
            />
            <path
                fill="#E27625"
                stroke="#E27625"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M47.19 59.73l-4.87 7.36 17.34.79-.58-18.7-11.9 10.55zM81.57 59.73L69.5 48.96l-.4 18.92 17.35-.8-4.87-7.35zM48.14 93.43l10.5-5.08-9.04-7.06-1.46 12.14zM70.13 88.35l10.47 5.08-1.43-12.14-9.04 7.06z"
            />
            <path
                fill="#D5BFB2"
                stroke="#D5BFB2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M80.59 93.43l-10.47-5.08.85 6.81-.09 2.89 9.7-4.62zM48.13 93.43l9.73 4.62-.06-2.89.83-6.81-10.5 5.08z"
            />
            <path
                fill="#233447"
                stroke="#233447"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M58.05 76.79l-8.7-2.56 6.14-2.82 2.56 5.38zM70.7 76.79l2.56-5.38 6.17 2.82-8.73 2.56z"
            />
            <path
                fill="#CC6228"
                stroke="#CC6228"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M48.13 93.43l1.52-12.53-9.68.27 8.16 12.26zM79.1 80.9l1.48 12.53 8.19-12.26-9.68-.27zM86.44 67.09l-17.35.79 1.62 8.9 2.55-5.37 6.18 2.82 7-7.14zM49.34 74.23l6.14-2.82 2.56 5.38 1.61-8.91-17.34-.8 7.03 7.15z"
            />
            <path
                fill="#E27525"
                stroke="#E27525"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M42.3 67.09l7.28 14.2-.24-7.06-7.03-7.14zM79.42 74.23l-.27 7.06 7.27-14.2-7 7.14zM59.65 67.88l-1.61 8.9 2.04 10.53.45-13.87-.88-5.56zM69.08 67.88l-.85 5.53.43 13.9L70.7 76.8l-1.62-8.91z"
            />
            <path
                fill="#F5841F"
                stroke="#F5841F"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M70.7 76.79L68.66 87.3l1.46 1.04 9.04-7.06.27-7.06-8.73 2.56zM49.35 74.23l.24 7.06 9.04 7.06 1.46-1.04-2.04-10.52-8.7-2.56z"
            />
            <path
                fill="#C0AC9D"
                stroke="#C0AC9D"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M70.89 98.05l.09-2.89-.8-.67H58.57l-.76.67.06 2.89-9.73-4.62 3.4 2.8 6.91 4.77h11.84l6.94-4.78 3.37-2.8-9.7 4.63z"
            />
            <path
                fill="#161616"
                stroke="#161616"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M70.13 88.35l-1.46-1.04h-8.59l-1.46 1.04-.82 6.81.76-.67H70.2l.79.67-.85-6.81z"
            />
            <path
                fill="#763E1A"
                stroke="#763E1A"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M101.16 52.3l2.58-12.59L99.84 28 70.13 50.05l11.44 9.67 16.16 4.72 3.56-4.17-1.55-1.12 2.46-2.25-1.89-1.46 2.47-1.89-1.61-1.25zM25 39.71l2.62 12.6-1.68 1.24 2.5 1.89-1.89 1.46 2.47 2.25-1.56 1.12 3.56 4.17 16.16-4.72 11.44-9.67L28.9 28 25 39.71z"
            />
            <path
                fill="#F5841F"
                stroke="#F5841F"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M97.73 64.44l-16.16-4.71 4.87 7.36-7.27 14.2 9.61-.12h14.36l-5.41-16.73zM47.19 59.73l-16.16 4.71-5.38 16.73h14.33l9.61.12-7.27-14.2 4.87-7.36zM69.1 67.88l1.03-17.83 4.69-12.68H53.94l4.69 12.68 1.03 17.83.4 5.6.03 13.83h8.58l.03-13.84.4-5.6z"
            />
        </svg>
    </SvgIcon>
)
