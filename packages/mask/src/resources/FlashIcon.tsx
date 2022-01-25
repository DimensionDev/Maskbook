import { MaskColorVar, makeStyles, MaskCSSVariableColor } from '@masknet/theme'

interface StyleProps {
    color: MaskCSSVariableColor
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    iconWrapper: {
        width: 20,
        height: 20,
        borderRadius: 999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: props.color.alpha(0.2),
    },
}))

export const FlashSvg = ({ color = MaskColorVar.redMain }) => (
    <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4.63739 0.644143L0.00450468 5.27703L2.45721 6.91216L1.36712 11L6 6.36712L3.5473 4.73198L4.63739 0.644143Z"
            fill={color.alpha(1)}
        />
    </svg>
)

export function FlashIcon({ color = MaskColorVar.redMain }) {
    const { classes } = useStyles({ color })
    return (
        <div className={classes.iconWrapper}>
            <FlashSvg color={color} />
        </div>
    )
}
