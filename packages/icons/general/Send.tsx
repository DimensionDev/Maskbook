import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SendIcon: typeof SvgIcon = createIcon(
    'SendIcon',
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.488 2.513c.15.15.15.393 0 .543L7.856 8.688a.384.384 0 11-.543-.543l5.632-5.632c.15-.15.393-.15.543 0z"
            fill="#fff"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.486 2.515a.39.39 0 01.092.405L9.931 13.34a.39.39 0 01-.725.03L7.183 8.816 2.632 6.795a.39.39 0 01.03-.726L13.08 2.422a.39.39 0 01.405.093zM3.85 6.48l3.788 1.683c.088.04.159.11.198.199l1.683 3.787 3.053-8.722L3.85 6.48z"
            fill="#fff"
        />
    </g>,
    '0 0 16 16',
)
