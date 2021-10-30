import { useStylesExtends } from '@masknet/shared'
import { keyframes, makeStyles } from '@masknet/theme'

const boxShadow = '0 2px 4px rgb(0 248 255 / 40%), 0 4px 8px rgb(37 41 46 / 20%)'
const rainbowBorderKeyFrames = keyframes`
0%,to {
    border-color: #00f8ff;
    box-shadow: ${boxShadow}
}

20% {
    border-color: #a4ff00;
    box-shadow: ${boxShadow}
}

40% {
    border-color: #f7275e;
    box-shadow: ${boxShadow}
}

60% {
    border-color: #ffd300;
    box-shadow: ${boxShadow}
}

80% {
    border-color: #ff8a00;
    box-shadow: ${boxShadow}
}
`

interface StyleProps {
    width: number
    height: number
    radius?: string
}
const useStyles = makeStyles<StyleProps>()((theme, { width, height, radius = '100%' }) => ({
    root: {
        animation: `${rainbowBorderKeyFrames} 6s linear infinite`,
        width,
        height,
        boxShadow: `${boxShadow}`,
        transition: '.125s ease',
        borderRadius: radius,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 0,
        border: '2px solid #00f8ff',
    },
}))

interface RainbowBoxProps extends withClasses<'root'> {
    width: number
    height: number
    radius?: string
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
