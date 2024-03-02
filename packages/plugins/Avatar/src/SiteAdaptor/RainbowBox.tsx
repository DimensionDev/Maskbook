import { keyframes, makeStyles } from '@masknet/theme'
import type { Keyframes } from '@emotion/serialize'

export const rainbowBorderKeyFrames: Keyframes = keyframes`
    0%, to {
        border-color: #00f8ff;
        box-shadow: 0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
    }
    20% {
        border-color: #a4ff00;
        box-shadow: 0 5px 15px rgba(164, 255, 0, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
    }
    40% {
        border-color: #f7275e;
        box-shadow: 0 5px 15px rgba(247, 39, 94, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
    }
    60% {
        border-color: #ffd300;
        box-shadow: 0 5px 15px rgba(255, 211, 0, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
    }
    80% {
        border-color: #ff8a00;
        box-shadow: 0 5px 15px rgba(255, 138, 0, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
    }
`

interface StyleProps {
    width?: number
    height?: number
    radius?: string
    size?: number
}

const useStyles = makeStyles<StyleProps>()((theme, { width, height, radius = '100%', size = 2 }) => ({
    root: {
        animation: `${rainbowBorderKeyFrames} 6s linear infinite`,
        width,
        height,
        boxShadow: '0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2)',
        transition: 'none',
        borderRadius: radius,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 0,
        border: `${size}px solid #00f8ff`,
    },
}))

interface RainbowBoxProps extends withClasses<'root'> {
    borderSize?: number
    width?: number
    height?: number
    radius?: string
    children?: React.ReactNode
}

export function RainbowBox(props: RainbowBoxProps) {
    const { classes } = useStyles(
        {
            width: props.width,
            height: props.height,
            radius: props.radius,
            size: props.borderSize,
        },
        { props },
    )

    return <div className={classes.root}>{props.children}</div>
}
