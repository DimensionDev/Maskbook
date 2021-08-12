import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const SearchIcon: typeof SvgIcon = createIcon(
    'Search',
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.271 9.41a4.93 4.93 0 118.478 3.424.617.617 0 00-.122.123A4.93 4.93 0 014.272 9.41zm8.837 4.79a6.18 6.18 0 11.884-.884l2.596 2.596a.625.625 0 11-.884.884L13.108 14.2z"
            fill="currentColor"
        />
    </g>,
    '0 0 20 20',
)
