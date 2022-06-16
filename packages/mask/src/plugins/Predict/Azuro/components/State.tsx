import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { Live } from './Live'

const useStyles = makeStyles()((theme) => ({
    startDate: { fontSize: 14, fontWeight: 300 },
}))

interface StateProps {
    starstAtDate: number
    state: number
}

export function State(props: StateProps) {
    const { t } = useI18N()
    const { starstAtDate, state } = props
    const { classes } = useStyles()

    return (
        <Grid>
            <Typography className={classes.startDate}>
                {state === 0 ? (
                    starstAtDate < Date.now() ? (
                        t('plugin_azuro_pending')
                    ) : (
                        <Live />
                    )
                ) : state === 1 ? (
                    t('plugin_azuro_finished')
                ) : state === 2 ? (
                    t('plugin_azuro_canceled')
                ) : null}
            </Typography>
        </Grid>
    )
}
