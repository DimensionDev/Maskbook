import { makeStyles } from '@masknet/theme'
import { FormControl, type FormControlProps, Typography } from '@mui/material'
import { useTip } from '../../contexts/index.js'
import { useI18N } from '../../locales/index.js'
import { RecipientSelect } from './RecipientSelect.js'

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
            fontFamily: 'Helvetica',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '18px',
            color: theme.palette.maskColor.danger,
            marginTop: theme.spacing(1),
        },
    }
})

interface Props extends FormControlProps {}

export const RecipientSection = ({ className, ...rest }: Props) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const {
        recipientValidation: [isValid, validateMessage],
    } = useTip()
    return (
        <FormControl fullWidth className={cx(classes.container, className)} {...rest}>
            <div className={classes.receiverRow}>
                <Typography className={classes.to}>{t.tip_to()}</Typography>
                <RecipientSelect className={classes.select} />
            </div>
            {isValid ? null : <div className={classes.validation}>{validateMessage}</div>}
        </FormControl>
    )
}
