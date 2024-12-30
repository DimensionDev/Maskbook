import { InputBase, inputBaseClasses, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => {
    return {
        input: {
            height: 70,
            position: 'relative',
            padding: theme.spacing(1.25, 1.5),
            fontWeight: 700,
            [`& > .${inputBaseClasses.input}`]: {
                paddingTop: `${theme.spacing(2.75)}!important`,
                paddingBottom: '0px !important',
                flex: 2,
                paddingLeft: '0px !important',
                fontSize: 14,
                fontWeight: 700,
            },
        },
        inputLabel: {
            fontSize: 13,
            lineHeight: '18px',
            position: 'absolute',
            top: 10,
            left: 12,
            color: theme.palette.maskColor.second,
        },
    }
})

interface MessageInputProps {
    message: string
    onChange: (val: string) => void
}
const messageMaxLength = 100
export const MessageInput = memo(function MessageInput({ message, onChange }: MessageInputProps) {
    const { classes } = useStyles()

    return (
        <InputBase
            className={classes.input}
            fullWidth
            value={message}
            onChange={(e) => onChange(e.target.value)}
            startAdornment={
                <Typography className={classes.inputLabel}>
                    <Trans>Message</Trans>
                </Typography>
            }
            endAdornment={
                <Typography className={classes.inputLabel} style={{ right: 12, left: 'auto' }}>
                    {message.length}/{messageMaxLength}
                </Typography>
            }
            placeholder={t`Best Wishes!`}
            inputProps={{
                maxLength: messageMaxLength,
            }}
        />
    )
})
