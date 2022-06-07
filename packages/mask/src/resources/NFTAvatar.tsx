import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M5 4C5 2.89543 5.89543 2 7 2H30C31.1046 2 32 2.89543 32 4V33C32 34.1046 31.1046 35 30 35H7C5.89543 35 5 34.1046 5 33V4Z"
            fill="url(#paint0_linear_551_8541)"
        />
        <path
            d="M13.794 7.40742C15.6102 5.94402 18.0834 5.53182 20.337 5.96022C22.389 6.44982 24.225 7.83042 25.2204 9.69702C25.9098 10.9246 26.124 12.3466 26.133 13.7362C26.1312 17.338 26.133 20.938 26.1312 24.5398C26.0718 25.0096 26.4426 25.3444 26.6784 25.7044C27.798 27.31 28.3218 29.2576 28.4136 31.198C27.7404 31.2016 27.0672 31.1998 26.394 31.198C26.2914 29.9452 26.07 28.6924 25.4832 27.5674C23.6454 27.5584 21.8094 27.598 19.9716 27.58C19.9608 26.2156 19.9662 24.8512 19.9644 23.4868C18.3966 23.1196 16.7406 23.3932 15.2682 24.0016C12.4548 25.1878 10.5504 28.1578 10.5612 31.1998H8.592C8.4984 28.795 9.4956 26.4262 11.0688 24.6352C11.2902 24.4264 11.211 24.0988 11.2344 23.8288C11.2146 21.0676 11.247 18.3046 11.2182 15.5434C11.1498 14.1682 11.193 12.7912 11.256 11.416C11.4198 9.77082 12.4296 8.30562 13.794 7.40742ZM20.2398 7.96362C20.4666 8.60262 21.0858 9.00582 21.3306 9.64302C22.0992 11.0722 21.8814 12.7264 21.9066 14.2816C21.9192 18.0634 21.9156 21.8434 21.9174 25.6252C22.6716 25.627 23.4276 25.6306 24.1818 25.6162C24.1764 21.6562 24.1782 17.6944 24.1818 13.7344C24.1728 12.7786 24.0774 11.794 23.6508 10.9228C23.019 9.50082 21.723 8.41362 20.2398 7.96362V7.96362ZM14.5842 9.25602C13.5888 9.90582 13.0956 11.1262 13.1334 12.289C15.4158 12.3106 17.6964 12.2962 19.9788 12.298C20.0598 10.7806 19.0788 9.23982 17.5776 8.85102C16.5768 8.49642 15.4914 8.78082 14.5842 9.25602V9.25602ZM13.1928 14.2366C13.182 15.0484 13.2108 15.9016 13.6392 16.6198C14.2764 17.8276 15.5976 18.5692 16.9494 18.6106C16.9512 19.255 16.9512 19.8994 16.9494 20.5456C15.5508 20.515 14.208 19.9696 13.1496 19.0624C13.1694 20.3206 13.1496 21.5788 13.164 22.8388C15.1566 21.5644 17.6316 21.0298 19.9698 21.4042C19.9572 19.0156 19.968 16.6252 19.9626 14.2366C17.7072 14.2348 15.45 14.2348 13.1928 14.2366V14.2366Z"
            fill="white"
        />
        <defs>
            <linearGradient
                id="paint0_linear_551_8541"
                x1="21.2416"
                y1="2"
                x2="21.2416"
                y2="34.9996"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF8D5C" />
                <stop offset="0.99" stopColor="#FFC49A" />
            </linearGradient>
        </defs>
    </svg>
)

export const NFTAvatarsIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>
