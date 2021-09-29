import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const EntropyfiIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
            <circle cx="210" cy="210" r="210" fill="#393e4b" />
            <g fill="none">
                <circle cx="210" cy="210" r="71.2" stroke="#dcfcf6" />
                <circle cx="210" cy="210" r="133.3" stroke="#dcfcf6" />
                <circle cx="210" cy="210" r="174.1" stroke="#dcfcf6" />
                <path d="M340 181a133 133 0 1 1-262 46" stroke="#73f6dd" />
                <path d="M156 257a71 71 0 0 1 103-98" stroke="#73f6dd" />
                <path d="M87 88a174 174 0 0 1 255 236" stroke="#73f6dd" />
            </g>
        </svg>
    </SvgIcon>
)
