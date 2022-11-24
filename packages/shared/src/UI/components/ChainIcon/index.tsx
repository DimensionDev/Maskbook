import { memo } from 'react'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    point: {
        width: 12.5,
        height: 12.5,
        borderRadius: 6.25,
        margin: 3.75,
    },
}))
export interface ChainIconProps extends withClasses<'point'> {
    color: string
    size?: number
    bordered?: boolean
}

export const ChainIcon = memo<ChainIconProps>(({ color, size = 12.5, ...props }) => {
    const { classes } = useStyles(undefined, { props })

    return (
        <div
            className={classes.point}
            style={{
                width: size,
                height: size,
                backgroundColor: color,
            }}
        />
    )
})
