import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const MaskGreyIcon: typeof SvgIcon = createIcon(
    'Mask',
    <g>
        <path fill="#8796AF" d="M60 120A60 60 0 1060 0a60 60 0 000 120z" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M96 46v20H33.42a27.21 27.21 0 0050.95 6H96v16.8a7.2 7.2 0 01-7.2 7.2H31.2a7.2 7.2 0 01-7.2-7.2V46h72zM77.47 72a21.18 21.18 0 01-35.03 0h35.03zM44.6 50.8a11.2 11.2 0 00-11.09 9.6h6.14a5.2 5.2 0 019.9 0h6.14a11.2 11.2 0 00-11.09-9.6zm30.8 0a11.2 11.2 0 00-11.09 9.6h6.14a5.2 5.2 0 019.9 0h6.14a11.2 11.2 0 00-11.09-9.6zM88.8 24a7.2 7.2 0 017.2 7.2V40H24v-8.8a7.2 7.2 0 017.2-7.2h57.6z"
            clipRule="evenodd"
        />
    </g>,
    '0 0 120 120',
    [130, 40],
)
