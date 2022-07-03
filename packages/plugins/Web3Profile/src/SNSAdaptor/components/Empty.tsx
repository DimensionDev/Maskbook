import { ImageIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales'

const useStyles = makeStyles()(() => ({
    icon: {
        marginLeft: 'calc(50% - 16px)',
    },
}))

export function Empty() {
    const { classes } = useStyles()
    const t = useI18N()
    return (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div>
                <ImageIcon
                    classes={{ icon: classes.icon }}
                    size={32}
                    icon={new URL('../assets/Empty.png', import.meta.url)}
                />
                <Typography color="#767f8d" marginTop="10px">
                    {t.add_wallet()}
                </Typography>
            </div>
        </div>
    )
}
