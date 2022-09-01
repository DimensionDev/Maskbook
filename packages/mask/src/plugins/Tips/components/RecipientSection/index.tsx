import { makeStyles } from '@masknet/theme'
import { FormControl, FormControlProps, Typography } from '@mui/material'
import type { FC } from 'react'
import { useI18N } from '../../locales/index.js'
import { RecipientSelect } from '../RecipientSelect'

const useStyles = makeStyles()(() => {
    return {
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
    }
})

interface Props extends FormControlProps {}

export const RecipientSection: FC<Props> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    return (
        <FormControl fullWidth className={cx(classes.receiverRow, className)} {...rest}>
            <Typography className={classes.to}>{t.tip_to()}</Typography>
            <RecipientSelect />
        </FormControl>
    )
}
