import { SvgIcon, SvgIconProps } from '@mui/material'
import type { FC } from 'react'

export const LooksrareIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props} viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_bd_10764_2231)">
            <path
                d="M17.4121 10.4428C21.0495 6.82538 26.949 6.82538 30.5863 10.4428L33.729 13.5676L30.5863 16.6924C26.949 20.3098 21.0495 20.3098 17.4121 16.6924L14.2695 13.5676L17.4121 10.4428Z"
                fill="black"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 13.5724L19.1351 6.43237H28.8649L36 13.5724L24 25.5675L12 13.5724ZM29.5135 10.9729C26.4811 7.92793 21.5189 7.92795 18.4865 10.9729L15.8919 13.5676L18.4865 16.1622C21.5189 19.2071 26.4811 19.2071 29.5135 16.1622L32.1081 13.5676L29.5135 10.9729Z"
                fill="#0CE466"
            />
            <path
                d="M24.0007 15.8377C22.7472 15.8377 21.7305 14.8217 21.7305 13.5674C21.7305 12.313 22.7472 11.2971 24.0007 11.2971C25.2543 11.2971 26.271 12.313 26.271 13.5674C26.271 14.8217 25.2543 15.8377 24.0007 15.8377Z"
                fill="black"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.2695 13.5674C20.2695 15.6281 21.9398 17.2971 23.9993 17.2971C26.0587 17.2971 27.729 15.6281 27.729 13.5674C27.729 11.5067 26.0587 9.83765 23.9993 9.83765C21.9398 9.83765 20.2695 11.5067 20.2695 13.5674ZM22.3776 13.5674C22.3776 14.4633 23.1041 15.189 23.9993 15.189C24.8944 15.189 25.6209 14.4633 25.6209 13.5674C25.6209 12.6714 24.8944 11.9458 23.9993 11.9458C23.1041 11.9458 22.3776 12.6714 22.3776 13.5674Z"
                fill="white"
            />
        </g>
        <defs>
            <filter
                id="filter0_bd_10764_2231"
                x="-4"
                y="-12"
                width="56"
                height="58"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="8" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_10764_2231" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="6" />
                <feGaussianBlur stdDeviation="6" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.0470588 0 0 0 0 0.894118 0 0 0 0 0.4 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="effect1_backgroundBlur_10764_2231" result="effect2_dropShadow_10764_2231" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_10764_2231" result="shape" />
            </filter>
        </defs>
    </SvgIcon>
)
