import { createIcon } from '../utils'

export const SelectedIcon = createIcon(
    'SelectedIcon',
    <g>
        <g clipPath="url(#a)">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z" fill="#60DFAB" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.738 5.008a.8.8 0 0 1 .054 1.13l-4 4.4a.8.8 0 0 1-1.113.07l-2.8-2.4a.8.8 0 1 1 1.042-1.215l2.21 1.894 3.477-3.825a.8.8 0 0 1 1.13-.054Z"
                fill="#fff"
            />
        </g>
        <defs>
            <clipPath id="a">
                <rect width="16" height="16" rx="8" fill="#fff" />
            </clipPath>
        </defs>
    </g>,
    '0 0 16 16',
)
