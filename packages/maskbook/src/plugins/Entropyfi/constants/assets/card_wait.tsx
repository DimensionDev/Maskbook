import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const WaitIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 1024 1024">
            <path
                fill="#878fa5"
                d="M262 138h474L597 354l88 51 187-291-44-75H161l-43 78 321 422 286 359H252l139-215-88-52-186 291 44 75h667l42-79-347-437z"
                data-spm-anchor-id="a313x.7781069.0.i0"
            />
            <path
                fill="#878fa5"
                d="M513 208H399l114 113 112-113H513zm-37 621H376l100-112 98 112h-98z"
                data-spm-anchor-id="a313x.7781069.0.i2"
            />
        </svg>
    </SvgIcon>
)
