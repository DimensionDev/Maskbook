import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const AuthorIcon: typeof SvgIcon = createIcon(
    'AuthorIcon',
    <g>
        <circle cx="18" cy="18" r="18" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 33.592V20a9 9 0 1118 0v13.592A17.917 17.917 0 0118 36c-3.279 0-6.352-.877-9-2.408z"
            fill="#AFC3E1"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M23.5 20.361v3.056h-9.561a4.157 4.157 0 007.784.916H23.5V26.9a1.1 1.1 0 01-1.1 1.1h-8.8a1.1 1.1 0 01-1.1-1.1v-6.539h11zm-2.832 3.972a3.235 3.235 0 01-2.675 1.413 3.235 3.235 0 01-2.675-1.413h5.35zm-5.02-3.239c-.863 0-1.576.638-1.695 1.467h.938a.795.795 0 011.512 0h.938a1.711 1.711 0 00-1.694-1.467zm4.705 0c-.862 0-1.575.638-1.694 1.467h.938a.795.795 0 011.512 0h.938a1.712 1.712 0 00-1.694-1.467zM22.4 17a1.1 1.1 0 011.1 1.1v1.344h-11V18.1a1.1 1.1 0 011.1-1.1h8.8z"
            fill="#fff"
        />
    </g>,
    '0 0 36 36',
)
