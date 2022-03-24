import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    applicationBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderRadius: '8px',
        cursor: 'pointer',
        height: 100,
        '&:hover': {
            transform: 'scale(1.05) translateY(-4px)',
            boxShadow: theme.palette.mode === 'light' ? '0px 10px 16px rgba(0, 0, 0, 0.1)' : 'none',
        },
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
    },
    title: {
        fontSize: 15,
    },
}))

interface Props {
    icon: string
    title: string
    onClick: () => void
}

export function ApplicationEntry(props: Props) {
    const { icon, title, onClick } = props
    const { classes } = useStyles()
    return (
        <div className={classes.applicationBox} onClick={onClick}>
            <img src={icon} className={classes.applicationImg} />
            <Typography className={classes.title} color="textPrimary">
                {title}
            </Typography>
        </div>
    )
}
