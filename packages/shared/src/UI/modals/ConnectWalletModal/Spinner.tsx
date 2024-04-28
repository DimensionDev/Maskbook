import { makeStyles } from '@masknet/theme'
import type { SVGAttributes } from 'react'

interface Props extends SVGAttributes<SVGElement> {
    variant: 'loading' | 'error'
}

const DASHARRAY = Math.PI * 2 * 78
const useStyles = makeStyles()({
    progress: {
        strokeDashoffset: '100%',
        transformOrigin: '50% 50%',
        '@keyframes circle-spinning': {
            '0%': {
                strokeDashoffset: DASHARRAY,
                transform: 'rotate(-30deg)',
            },
            '50%': {
                strokeDashoffset: 0,
                transform: 'rotate(0deg)',
            },
            '100%': {
                strokeDashoffset: -DASHARRAY,
                transform: 'rotate(30deg)',
            },
        },
        animation: 'circle-spinning 1s linear infinite',
    },
})

export function Spinner({ variant, ...rest }: Props) {
    const { classes, theme } = useStyles()
    const { maskColor } = theme.palette
    const colorMap: Record<Props['variant'], string> = {
        loading: maskColor.line,
        error: maskColor.danger,
    }
    const color = colorMap[variant] || colorMap.loading
    return (
        <svg viewBox="0 0 160 160" {...rest}>
            <circle r="78" cx="80" cy="80" fill="transparent" stroke={color} strokeWidth="2" />
            {variant === 'loading' ?
                <circle
                    r="78"
                    cx="80"
                    cy="80"
                    fill="transparent"
                    stroke={maskColor.main}
                    strokeWidth="4"
                    strokeDasharray={`${DASHARRAY.toFixed(3)}px`}
                    className={classes.progress}
                />
            :   null}
        </svg>
    )
}
