import { useStylesExtends } from '@masknet/shared'
import { keyframes, makeStyles } from '@masknet/theme'
import { boxShadow } from '../constants'

const rainbowBoxKeyFrames = keyframes`
0%,to {
    background-color: #00f8ff;
    box-shadow: ${boxShadow}
}

20% {
    background-color: #a4ff00;
    box-shadow: ${boxShadow}
}

40% {
    background-color: #f7275e;
    box-shadow: ${boxShadow}
}

60% {
    background-color: #ffd300;
    box-shadow: ${boxShadow}
}

80% {
    background-color: #ff8a00;
    box-shadow: ${boxShadow}
}
`

interface StyleProps {
    width: number
    height: number
    radius: string
}
const useStyles = makeStyles<StyleProps>()((theme, { width, height, radius }) => ({
    root: {
        animation: `${rainbowBoxKeyFrames} 6s linear infinite`,
        width,
        height,
        boxShadow: `${boxShadow}`,
        transition: '.125s ease',
        borderRadius: radius,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 0,
    },
}))

interface RainbowBoxProps extends withClasses<'root'> {
    width: number
    height: number
    radius: string
    children?: React.ReactNode
}
export function RainbowBox(props: RainbowBoxProps) {
    const classes = useStylesExtends(
        useStyles({
            width: props.width,
            height: props.height,
            radius: props.radius,
        }),
        props,
    )

    return <div className={classes.root}>{props.children}</div>
}
