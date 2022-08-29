import { ImageIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    icon: {
        marginLeft: 'calc(50% - 16px)',
    },
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
    },
}))

interface EmptyProps {
    content: string
    showIcon?: boolean
}

export function Empty({ content, showIcon = true }: EmptyProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.wrapper}>
            <div>
                {showIcon && (
                    <ImageIcon
                        classes={{ icon: classes.icon }}
                        size={32}
                        icon={new URL('../assets/Empty.png', import.meta.url)}
                    />
                )}
                <Typography className={classes.content}>{content}</Typography>
            </div>
        </div>
    )
}
