import { Button, makeStyles, Typography, MenuItem } from '@material-ui/core'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'
import { ToolIconURLs, ToolIconTypes } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { useMenu } from '../../utils/hooks/useMenu'

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
            '& $text': {
                color: theme.palette.primary.main,
            },
            '& $icon': {
                color: theme.palette.primary.main,
            },
        },
    },
    text: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 20,
        marginLeft: 22,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
    },
}))

export function ToolboxHint() {
    const classes = useStyles()
    const [menu, openMenu] = useMenu(
        <>
            {Object.keys(ToolIconURLs).map((key) => {
                return (
                    <MenuItem>
                        <Image src={ToolIconURLs[key as ToolIconTypes].image} width={24} height={24} />
                        <Typography className={classes.text}>{ToolIconURLs[key as ToolIconTypes].text}</Typography>
                    </MenuItem>
                )
            })}
        </>,
    )

    return (
        <>
            <Button className={classes.wrapper} onClick={openMenu}>
                <MaskbookSharpIcon classes={{ root: classes.icon }} />
                <Typography className={classes.text}>Mask</Typography>
            </Button>
            {menu}
        </>
    )
}
