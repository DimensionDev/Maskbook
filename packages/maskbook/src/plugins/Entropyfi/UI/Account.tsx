import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useValuePerShortToken } from '../hooks/usePoolData'
import { useAccount, useChainId } from '@masknet/web3-shared'
import { useEffect } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        backgroundColor: 'rgba(33, 39, 41, 0.096)',
        textAlign: 'center',
        padding: theme.spacing(2),
    },
}))

export function Account() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const chainId = useChainId()
    const rest = useValuePerShortToken(chainId, 'BTC-USDT')
    useEffect(() => {
        console.log('res', rest)
    })

    return (
        <Grid container direction="column" className={classes.root}>
            <Typography color="#FFF" marginLeft="10px" align="center" variant="h6">
                Coming Soon...
            </Typography>
        </Grid>
    )
}
