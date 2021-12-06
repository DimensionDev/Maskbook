import { Paper, Box, Typography, Button } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import WarningIcon from '@mui/icons-material/Warning'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            margin: theme.spacing(2, 'auto'),
            padding: theme.spacing(1),
        },
        icon: {
            marginRight: theme.spacing(1),
        },
        type: {
            display: 'flex',
        },
    }
})

export interface PriceStaleWarningProps extends withClasses<never> {
    onAccept(): void
}

export function PriceStaleWarning(props: PriceStaleWarningProps) {
    const { onAccept } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Paper className={classes.root} variant="outlined">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                <Typography className={classes.type} color="primary">
                    <WarningIcon className={classes.icon} />
                    <span>{t('plugin_trader_price_updated')}</span>
                </Typography>
                <Button variant="text" color="primary" onClick={onAccept}>
                    {t('accept')}
                </Button>
            </Box>
        </Paper>
    )
}
