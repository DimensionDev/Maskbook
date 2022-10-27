import { makeStyles, ActionButton, LoadingBase } from '@masknet/theme'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Grid, Typography, Link } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done'
import type { NetworkPluginID } from '@masknet/shared-base'

import { useI18N } from '../../locales/index.js'
import { TransactionStatus, ChainId } from '../../types.js'

const useStyles = makeStyles()(() => ({
    confirmation: {
        padding: '44px 60px 40px',
    },
    heading: {
        fontSize: '20px',
        fontWeight: 600,
    },
    title: {
        margin: '12px 0 8px',
    },
}))

type TransactionProps =
    | {
          status: TransactionStatus.CONFIRMATION
          title: string
          subtitle?: string
      }
    | {
          status: TransactionStatus.CONFIRMED
          actionButton: {
              label: string
              onClick: () => void
          }
          transactionHash: string
      }

export function Transaction(props: TransactionProps) {
    const t = useI18N()
    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { classes } = useStyles()

    if (props.status === TransactionStatus.CONFIRMATION) {
        return (
            <Grid
                container
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                className={classes.confirmation}>
                <LoadingBase size={72} />
                <Typography fontWeight={600} className={classes.title} variant="h6">
                    {props.title}
                </Typography>
                {props.subtitle && <Typography fontWeight={500}>{props.subtitle}</Typography>}
            </Grid>
        )
    }
    if (props.status === TransactionStatus.CONFIRMED) {
        return (
            <Typography>
                <Grid container textAlign="center" rowSpacing="5px" sx={{ p: 2 }}>
                    <Grid item xs={12}>
                        <DoneIcon sx={{ fontSize: 60 }} />
                    </Grid>
                    <Grid item xs={12} className={classes.heading}>
                        {t.transaction_confirmed()}
                    </Grid>
                    <Grid item xs={12}>
                        <Link
                            href={explorerResolver.transactionLink?.(currentChainId as ChainId, props.transactionHash)}
                            target="_blank">
                            {t.view_on_explorer()}
                        </Link>
                    </Grid>

                    <Grid item xs={12} marginTop={2}>
                        <ActionButton fullWidth size="medium" onClick={props.actionButton.onClick}>
                            {props.actionButton.label}
                        </ActionButton>
                    </Grid>
                </Grid>
            </Typography>
        )
    }
    return <>{null}</>
}
