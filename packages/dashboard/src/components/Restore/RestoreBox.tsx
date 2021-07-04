import { Button, makeStyles, useTheme } from '@material-ui/core'
import { getMaskColor } from '@masknet/theme'

const useStyle = makeStyles((theme) => ({
    root: {
        whiteSpace: 'pre-line',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: '0.4s',
        overflow: 'hidden',
        '&[data-active=true]': {
            color: 'black',
        },
    },
    icon: {
        top: 0,
        bottom: 0,
        left: 4,
        right: 'auto',
        margin: 'auto',
        position: 'absolute',
    },
    button: {
        maxWidth: '90%',
        position: 'relative',
        '& > span:first-child': {
            display: 'inline-block',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
        },
    },
    buttonText: {
        height: 28,
        lineHeight: 1,
        paddingTop: 0,
        paddingBottom: 0,
        color: getMaskColor(theme).normalText,
    },
    placeholder: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        width: 64,
        height: 64,
        margin: '20px auto',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '64px 64px',

        '& > svg': {
            width: '100%',
            height: '100%',
        },
    },
    placeholderImage: {
        width: 64,
        height: 64,
    },
}))

export interface RestoreBoxProps extends withClasses<never> {
    file: File | null
    entered: boolean
    enterText: string
    leaveText: string
    darkPlaceholderIcon: React.ReactNode
    lightPlaceholderIcon: React.ReactNode
    children?: React.ReactNode
    onClick?: () => void
}

export function RestoreBox(props: RestoreBoxProps) {
    const { entered, file, enterText, leaveText, children, onClick } = props
    const { darkPlaceholderIcon, lightPlaceholderIcon } = props
    const classes = useStyle()
    const theme = useTheme()
    const placeholder = theme.palette.mode === 'dark' ? darkPlaceholderIcon : lightPlaceholderIcon
    return (
        <div className={classes.root} data-active={entered} onClick={onClick}>
            <div className={classes.placeholder}>{children ? children : placeholder}</div>
            <Button
                className={classes.button}
                classes={{ text: classes.buttonText }}
                variant="text"
                style={{ paddingLeft: entered || file ? 8 : 28 }}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}>
                {entered ? enterText : file ? file.name : leaveText}
            </Button>
        </div>
    )
}
