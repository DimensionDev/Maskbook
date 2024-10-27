import { memo, useMemo } from 'react'

interface Props {
    handle: string
    size?: number | string
    className?: string
}
export const LensAvatar = memo<Props>(({ handle, size, className }) => {
    const id1 = useMemo(() => crypto.randomUUID(), [])
    const id2 = useMemo(() => crypto.randomUUID(), [])
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size ?? 100}
            height={size ?? 100}
            className={className}
            fill="none"
            viewBox="0 0 450 450">
            <defs>
                <linearGradient id={id1} x1={-137} x2={415} y1={-236} y2={486} gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" />
                    <stop offset={1} stopColor="#fff" stopOpacity={0.2} />
                </linearGradient>
                <clipPath id={id2}>
                    <rect width={450} height={450} fill="#fff" rx={16} />
                </clipPath>
            </defs>
            <g clipPath={`url(#${id2})`}>
                <path fill="#ABFE2C" d="M0 0h450v450H0z" />
                <path
                    fill="#00501e"
                    d="m231.3 345.6.1.2-.3-67a113.6 113.6 0 0 0 99.7 58.6 115 115 0 0 0 48.9-10.8l-5.8-10a103.9 103.9 0 0 1-120.5-25.5l4.3 2.9a77 77 0 0 0 77.9 1l-5.7-10-2 1.1a66.4 66.4 0 0 1-96.5-54c19-1.1-30.8-1.1-12 .1a66.4 66.4 0 0 1-98.5 52.8l-5.7 10 2.4 1.2a76.1 76.1 0 0 0 79.8-5 103.9 103.9 0 0 1-120.6 25.5l-5.7 9.9a115 115 0 0 0 138.5-32.2c3.8-4.8 7.2-10 10-15.3l.6 66.9v-.4h11Z"
                />
                <path
                    stroke="#00501e"
                    strokeLinejoin="round"
                    strokeWidth={8.3}
                    d="M241.6 182.8c-2.4 6.6-9.6 12.2-19.2 12.2-9.3 0-17.3-5.3-19.4-12.4"
                />
                <g fill="#00501e">
                    <path d="M187.3 158.6a11.9 11.9 0 1 1-23.8 0 11.9 11.9 0 0 1 23.8 0ZM271.1 158.6a11.9 11.9 0 1 1-23.8 0 11.9 11.9 0 0 1 23.8 0Z" />
                </g>
                <path
                    stroke="#00501e"
                    strokeLinejoin="round"
                    strokeWidth={8.3}
                    d="M148.8 166.4c0-14.6 13.8-26.4 30.8-26.4s30.8 11.8 30.8 26.4m23.2 0c0-14.6 13.8-26.4 30.8-26.4s30.8 11.8 30.8 26.4"
                />
                <path
                    stroke="#00501e"
                    strokeMiterlimit={10}
                    strokeWidth={11.2}
                    d="m279.1 100.3-3.2 3.3.1-4.6v-4.7c-1.8-65.4-100.3-65.4-102.1 0l-.1 4.7v4.6l-3.1-3.3-3.4-3.3C119.8 52 50 121.7 95 169.2l3.3 3.4c54.3 54.2 126.6 54.4 126.6 54.4s72.3-.2 126.5-54.4l3.3-3.4C399.7 121.7 330 52 282.5 97l-3.4 3.3Z"
                />
                <path fill="#ABFE2C" d="M0 370h450v80H0z" />
                <text
                    x={225}
                    y={410}
                    fill="#00501E"
                    dominantBaseline="middle"
                    fontFamily="Space Grotesk"
                    fontSize={24}
                    fontWeight={500}
                    letterSpacing="0em"
                    textAnchor="middle">
                    @{handle}
                </text>
                <rect width={444} height={444} x={2.5} y={2.5} stroke={`url(#${id1})`} strokeWidth={5} rx={13} />
                <path
                    fill="#fff"
                    fillOpacity={0.8}
                    d="M70 423a14 14 0 0 1-13-1c2 1 5 1 8-1l-1-2h-1a9 9 0 0 1-8 0 9 9 0 0 1-4-6c3-1 11-2 17-8v-1a8 8 0 0 0 3-6c0-2-1-4-3-5-1-2-3-3-5-3l-5 1-3-4c-2-2-4-2-6-2s-4 0-5 2l-3 4-5-1-6 3-2 5a8 8 0 0 0 2 6l1 1c6 6 14 7 17 8a9 9 0 0 1-4 6 9 9 0 0 1-9 0l-2 2h1c2 2 5 2 8 1a14 14 0 0 1-13 1h-1l-1 2 1 1c3 1 7 2 10 1a16 16 0 0 0 10-6v6h3v-6a16 16 0 0 0 13 6l7-1 1-1-2-2Zm-27-29v-1c1-4 4-6 6-6 3 0 6 2 6 6v5l2-3h1v-1c3-2 6-1 8 0 2 2 3 6 0 8v1c-7 7-17 7-17 7s-9 0-16-7l-1-1c-3-2-2-6 0-8l4-1 4 1 1 1 3 3-1-4Z"
                />
            </g>
        </svg>
    )
})

LensAvatar.displayName = 'LensAvatar'
