import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const EntropyfiIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
            <g>
                <circle cx="210" cy="210" r="210" fill="#393e4b" />
            </g>
            <g>
                <circle
                    cx="210"
                    cy="210"
                    r="71.15"
                    fill="none"
                    stroke="#dcfcf6"
                    strokeMiterlimit="10"
                    strokeWidth="4px"
                />
                <circle
                    cx="210"
                    cy="210"
                    r="133.29"
                    fill="none"
                    stroke="#dcfcf6"
                    strokeMiterlimit="10"
                    strokeWidth="4px"
                />
                <circle
                    cx="210"
                    cy="210"
                    r="174.05"
                    fill="none"
                    stroke="#dcfcf6"
                    strokeMiterlimit="10"
                    strokeWidth="4px"
                />
                <path
                    d="M380.09,220.84a133.31,133.31,0,1,1-262.25,46.55"
                    transform="translate(-40 -40)"
                    fill="none"
                    stroke="#73f6dd"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="10px"
                />
                <path
                    d="M196.39,296.78a71.15,71.15,0,0,1,102.86-98.13"
                    transform="translate(-40 -40)"
                    fill="none"
                    stroke="#73f6dd"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="10px"
                />
                <path
                    d="M126.53,128.09A174.1,174.1,0,0,1,382.21,363.9"
                    transform="translate(-40 -40)"
                    fill="none"
                    stroke="#73f6dd"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="10px"
                />
            </g>
        </svg>
    </SvgIcon>
)
