import { Box, InputBase, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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

interface RedpacketMessagePanelProps {
    message: string
    onChange: (val: string) => void
}
export function RedpacketMessagePanel(props: RedpacketMessagePanelProps) {
    const { _ } = useLingui()
    const { onChange, message } = props
    const { classes, cx } = useStyles()

    return (
        <Box className={classes.root}>
            <div className={classes.wrapper}>
                <Typography>
                    <Trans>Enclose a Message</Trans>
                </Typography>
            </div>
            <div className={cx(classes.wrapper)}>
                <InputBase
                    className={classes.input}
                    onChange={(e) => onChange(e.target.value)}
                    inputProps={{ maxLength: 100, placeholder: _(msg`Best Wishes!`) }}
                    value={message}
                />
            </div>
        </Box>
    )
}
