import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const UsdtIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 1024 1024">
            <path
                fill="#26A17B"
                d="M0 512a512 512 0 1 0 1024 0A512 512 0 1 0 0 512z"
                data-spm-anchor-id="a313x.7781069.0.i12"
            />
            <path
                fill="#FFF"
                d="M574 556a978 978 0 0 1-126 0c-124-5-217-27-217-53s93-47 217-53v85a946 946 0 0 0 126 0v-85c124 6 216 27 216 53s-92 48-216 53m0-115v-75h173V250H275v116h173v75c-141 7-246 35-246 68 0 34 105 61 246 68v243h126V577c140-7 246-35 246-68s-106-61-246-68"
            />
        </svg>
    </SvgIcon>
)
