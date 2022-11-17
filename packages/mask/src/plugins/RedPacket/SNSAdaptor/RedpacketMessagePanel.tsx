import { Box, InputBase, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            width: '100%',
        },
        wrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
        },

        input: {
            flex: 1,
            padding: theme.spacing(0.5),
        },
    }
})

export interface RedpacketMessagePanelProps {
    message: string
    onChange: (val: string) => void
}
export function RedpacketMessagePanel(props: RedpacketMessagePanelProps) {
    const { onChange, message } = props
    const { classes, cx } = useStyles()
    const t = useI18N()

    return (
        <Box className={classes.root}>
            <div className={classes.wrapper}>
                <Typography>{t.message_label()}</Typography>
            </div>
            <div className={cx(classes.wrapper)}>
                <InputBase
                    className={classes.input}
                    onChange={(e) => onChange(e.target.value)}
                    inputProps={{ placeholder: t.best_wishes() }}
                    value={message}
                />
            </div>
        </Box>
    )
}
