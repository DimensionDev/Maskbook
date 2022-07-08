import { ImageIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales'

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
}

export function Empty({ content }: EmptyProps) {
    const { classes } = useStyles()
    const t = useI18N()
    return (
        <div className={classes.wrapper}>
            <div>
                <ImageIcon
                    classes={{ icon: classes.icon }}
                    size={32}
                    icon={new URL('../assets/Empty.png', import.meta.url)}
                />
                <Typography className={classes.content}>{content}</Typography>
            </div>
        </div>
    )
}
