import { createIcon } from '@masknet/icons'

export const Checkbox = createIcon(
    'Checkbox',
    <g>
        <circle cx="12" cy="12" r="10" fill="#1C68F3" />
        <path
            d="M7 12.5L10.3333 16L17 9"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </g>,
    '0 0 24 24',
)

export const UncheckIcon = createIcon(
    'UncheckIcon',
    <g>
        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" stroke="#CFD9DE" />
    </g>,
    '0 0 24 24',
)
