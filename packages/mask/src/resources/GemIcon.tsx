import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4.54814 4.32674L0.804523 8.0274C-0.0207785 8.85259 -0.0207785 10.1932 0.804523 11.0183L1.84675 12.0604L11.4129 3.70996H6.04396C5.4834 3.70996 4.94535 3.93245 4.54814 4.32674Z"
            fill="url(#paint0_linear_3042_21346)"
        />
        <path
            d="M10.1819 3.70996L1.84668 12.0604L4.38194 14.5951L16.9734 3.70996H10.1819Z"
            fill="url(#paint1_linear_3042_21346)"
        />
        <path
            d="M15.2719 3.70973L4.38184 14.5949L6.91708 17.1296L20.579 5.52909L19.4747 4.4279C19.0324 3.96602 18.4185 3.7041 17.779 3.7041H15.2719V3.70973Z"
            fill="url(#paint2_linear_3042_21346)"
        />
        <path
            d="M19.5507 4.50098L6.91699 17.1294L9.45504 19.6669L22.6973 7.64964L19.5507 4.50098Z"
            fill="url(#paint3_linear_3042_21346)"
        />
        <path
            d="M10.4409 20.6528L9.45508 19.6671L22.1113 7.06396L23.1563 8.10882C23.9818 8.93401 24.0549 10.1929 23.2296 11.0181L13.5451 20.6556C12.686 21.5118 11.2973 21.5089 10.4409 20.6528Z"
            fill="url(#paint4_linear_3042_21346)"
        />
        <defs>
            <linearGradient
                id="paint0_linear_3042_21346"
                x1="0.110756"
                y1="11.8654"
                x2="5.85027"
                y2="6.12488"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#C774FF" />
                <stop offset="1" stopColor="#D677DB" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_3042_21346"
                x1="5.48593"
                y1="11.8351"
                x2="9.92877"
                y2="7.36129"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#EF7A9D" />
                <stop offset="1" stopColor="#D677DB" />
            </linearGradient>
            <linearGradient
                id="paint2_linear_3042_21346"
                x1="10.5292"
                y1="11.6435"
                x2="14.5777"
                y2="7.79566"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#EF7A9D" />
                <stop offset="1" stopColor="#FF936D" />
            </linearGradient>
            <linearGradient
                id="paint3_linear_3042_21346"
                x1="9.57057"
                y1="17.1855"
                x2="19.0975"
                y2="8.02036"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFC846" />
                <stop offset="1" stopColor="#FF936D" />
            </linearGradient>
            <linearGradient
                id="paint4_linear_3042_21346"
                x1="12.6636"
                y1="18.9789"
                x2="21.9245"
                y2="9.79603"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFC846" />
                <stop offset="1" stopColor="#FFC846" />
            </linearGradient>
        </defs>
    </svg>
)

export function GemIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
