import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const BtcIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 32 32">
            <g clipPath="url(#clip0)">
                <path fill="#fff" d="M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16z" />
                <path
                    fill="#F7931A"
                    d="M31.521 19.873c-2.137 8.572-10.82 13.79-19.393 11.651C3.558 29.387-1.659 20.704.48 12.133 2.615 3.56 11.298-1.657 19.87.48 28.442 2.616 33.659 11.3 31.52 19.873z"
                />
                <path
                    fill="#fff"
                    d="M23.084 13.698c.318-2.129-1.303-3.274-3.52-4.037l.719-2.885-1.756-.437-.7 2.808a72.867 72.867 0 0 0-1.407-.33l.705-2.828-1.755-.438-.72 2.884a58.076 58.076 0 0 1-1.12-.264l.002-.009-2.422-.604-.467 1.875s1.303.299 1.275.317c.711.178.84.648.819 1.021l-.82 3.287c.05.012.113.03.183.058l-.186-.046-1.148 4.604c-.087.216-.307.54-.804.417.017.025-1.277-.319-1.277-.319l-.872 2.01 2.285.57c.426.107.842.218 1.252.323l-.726 2.918 1.754.437.72-2.886c.478.13.943.25 1.399.363l-.717 2.873 1.756.437.726-2.912c2.994.567 5.246.338 6.193-2.37.764-2.18-.038-3.438-1.613-4.258 1.148-.265 2.012-1.02 2.242-2.578zm-4.012 5.626c-.543 2.18-4.214 1.002-5.405.706l.965-3.865c1.19.297 5.007.885 4.44 3.16zm.543-5.657c-.495 1.983-3.551.976-4.542.729l.874-3.506c.991.247 4.183.708 3.668 2.777z"
                />
            </g>
            <defs>
                <clipPath id="clip0">
                    <path fill="#fff" d="M0 16C0 7.163 7.163 0 16 0s16 7.163 16 16-7.163 16-16 16S0 24.837 0 16z" />
                </clipPath>
            </defs>
        </svg>
    </SvgIcon>
)
