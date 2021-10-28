import { useStylesExtends } from '@masknet/shared'
import { keyframes, makeStyles } from '@masknet/theme'

const rainbowBoxKeyFrames = keyframes`
0%,to {
    background-color: #00f8ff;
    -webkit-box-shadow: 0 5px 10px rgba(0,248,255,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(0,248,255,.4),0 10px 20px rgba(37,41,46,.2)
}

20% {
    background-color: #a4ff00;
    -webkit-box-shadow: 0 5px 10px rgba(164,255,0,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(164,255,0,.4),0 10px 20px rgba(37,41,46,.2)
}

40% {
    background-color: #f7275e;
    -webkit-box-shadow: 0 5px 10px rgba(247,39,94,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(247,39,94,.4),0 10px 20px rgba(37,41,46,.2)
}

60% {
    background-color: #ffd300;
    -webkit-box-shadow: 0 5px 10px rgba(255,211,0,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(255,211,0,.4),0 10px 20px rgba(37,41,46,.2)
}

80% {
    background-color: #ff8a00;
    -webkit-box-shadow: 0 5px 10px rgba(255,138,0,.4),0 10px 20px rgba(37,41,46,.2);
    box-shadow: 0 5px 10px rgba(255,138,0,.4),0 10px 20px rgba(37,41,46,.2)
}
`

interface StyleProps {
    width: number
    height: number
    radius: string
}
const useStyles = makeStyles<StyleProps>()((theme, { width, height, radius }) => ({
    root: {
        animationDelay: '0.2',
        animation: `${rainbowBoxKeyFrames} 6s linear infinite`,
        webkitAnimation: `${rainbowBoxKeyFrames} 6s linear infinite`,
        width,
        height,
        boxShadow: '0 5px 10px rgb(0 248 255 / 40%), 0 10px 20px rgb(37 41 46 / 20%)',
        transition: '.125s ease',
        borderRadius: radius,
    },
}))

interface RainbowBoxProps extends withClasses<'root'> {
    width: number
    height: number
    radius: string
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

    return <div className={classes.root} />
}
