import { makeStyles } from '@masknet/theme'
import { FormControl, type FormControlProps, Typography } from '@mui/material'
import { useTip } from '../../contexts/index.js'
import { RecipientSelect } from './RecipientSelect.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        container: {
            width: 'auto',
        },
        receiverRow: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: 'auto',
        },
        to: {
            fontSize: 19,
            fontWeight: 500,
        },
        select: {
            marginLeft: theme.spacing(2),
        },
        validation: {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '18px',
            color: theme.palette.maskColor.danger,
            marginTop: theme.spacing(1),
        },
    }
})

interface Props extends FormControlProps {}

export function RecipientSection({ className, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const {
        recipientValidation: [isValid, validateMessage],
    } = useTip()
    return (
        <FormControl fullWidth className={cx(classes.container, className)} {...rest}>
            <div className={classes.receiverRow}>
                <Typography className={classes.to}>
                    <Trans>To</Trans>
                </Typography>
                <RecipientSelect className={classes.select} />
            </div>
            {isValid ? null : <div className={classes.validation}>{validateMessage}</div>}
        </FormControl>
    )
}
