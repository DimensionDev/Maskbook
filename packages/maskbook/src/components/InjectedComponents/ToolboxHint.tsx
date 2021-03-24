import { Button, makeStyles, Typography } from '@material-ui/core'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '12px 26px 12px 12px',
        cursor: 'pointer',
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(-6px)',
            padding: 12,
        },
        '&:hover': {
            "& $text": {
                color: theme.palette.primary.main,
            },
            "& $icon": {
                color: theme.palette.primary.main,
            }
        },
    },
    text: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 20,
        marginLeft: 22,
        [theme.breakpoints.down('lg')]: {
            display: 'none'
        }
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
    },
}))

export function ToolboxHint() {
    const classes = useStyles()

    return (
        <Button className={classes.wrapper}>
            <MaskbookSharpIcon classes={{ root: classes.icon }} />
            <Typography className={classes.text}>Mask</Typography>
        </Button>
    )
}
