import type { UserBet } from '../types'
import { Bet } from './Bet'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { Grid, Typography } from '@mui/material'
import { useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { Loader } from './Loader'
import { Placeholder } from './Placeholder'

const useStyles = makeStyles()((theme) => ({
    container: {
        height: 300,
        overflow: 'auto',
        '& > div': {
            marginBottom: theme.spacing(1.5),
        },
    },
}))

interface BetsProps {
    bets: UserBet[] | undefined
    loading: boolean
    error: Error | undefined
    retry: () => void
}

export function Bets(props: BetsProps) {
    const { bets, error, loading, retry } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [openDialog, setOpenDialog] = useState<boolean>(false)

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    if (loading) {
        return <Loader />
    }

    if (error) {
        return (
            <Grid container alignItems="center" justifyContent="center" className={classes.container}>
                <Typography variant="body2" textAlign="center">
                    {t('go_wrong')}
                </Typography>
            </Grid>
        )
    }

    if (bets?.length === 0) {
        return <Placeholder />
    }

    return (
        <Grid>
            <div className={classes.container}>
                {bets?.map((bet: UserBet) => {
                    return <Bet key={bet.nftId} bet={bet} retry={retry} />
                })}
            </div>
        </Grid>
    )
}
