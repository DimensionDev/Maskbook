import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    content: {
        color: theme.palette.maskColor.second,
        marginTop: '10px',
    },
    wrapper: {
        height: '100%',
        display: 'flex',
        paddingTop: '24px',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
}))

interface EmptyProps {
    content: string
    showIcon?: boolean
}

export function Empty({ content, showIcon }: EmptyProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.wrapper}>
            {showIcon ? <Icons.EmptySimple size={36} /> : null}
            <Typography className={classes.content}>{content}</Typography>
        </div>
    )
}
