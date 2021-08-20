import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const CardIcon: typeof SvgIcon = createIcon(
    'CardIcon',
    <g>
        <g clipPath="url(#card_clip0)" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2.667h-12c-.737 0-1.333.597-1.333 1.333v8c0 .737.596 1.334 1.333 1.334h12c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333zM1.167 6.667h14.666" />
        </g>
        <defs>
            <clipPath id="card_clip0">
                <path fill="#fff" transform="translate(.5)" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </g>,
    '0 0 16 16',
)
