import { createIcon } from '../utils'

export const FailedIcon = createIcon(
    'FailedIcon',
    <>
        <circle cx="18" cy="18" r="18" fill="#FF5F5F" fillOpacity=".15" />
        <path
            d="M23 13L13 23M13 13l10 10"
            stroke="#FF5F5F"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </>,
    '0 0 36 36',
)
