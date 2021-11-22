import { useStylesExtends } from '@masknet/shared'
import { keyframes, makeStyles } from '@masknet/theme'

const rainbowBorderKeyFrames = keyframes`
0%,to {
    border-color: #00f8ff;
    box-shadow: 0 5px 15px rgba(0,248,255,.4),0 10px 30px rgba(37,41,46,.2);
}

20% {
    border-color: #a4ff00;
    box-shadow: 0 5px 15px rgba(164,255,0,.4),0 10px 30px rgba(37,41,46,.2);
}

40% {
    border-color: #f7275e;
    box-shadow: 0 5px 15px rgba(247,39,94,.4),0 10px 30px rgba(37,41,46,.2)
}

60% {
    border-color: #ffd300;
    box-shadow: 0 5px 15px rgba(255,211,0,.4),0 10px 30px rgba(37,41,46,.2)
}

80% {
    border-color: #ff8a00;
    box-shadow: 0 5px 15px rgba(255,138,0,.4),0 10px 30px rgba(37,41,46,.2)
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
        boxShadow: 'box-shadow: 0 5px 15px rgb(0 248 255 / 40%), 0 10px 30px rgb(37 41 46 / 20%);',
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
