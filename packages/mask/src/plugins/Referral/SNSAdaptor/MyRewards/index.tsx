import { useAsync } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Grid, Typography } from '@mui/material'

import { useI18N } from '../../locales/index.js'
import { getRequiredChainId } from '../../helpers/index.js'
import type { PageInterface } from '../../types.js'
import { ReferralRPC } from '../../messages.js'

import { WalletConnectedBoundary, ChainBoundary } from '@masknet/shared'
import { Rewards } from './Rewards.js'

import { LoadingBase, makeStyles } from '@masknet/theme'

export const useStyles = makeStyles()((theme) => ({
    msg: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: theme.palette.background.default,
        padding: '12px 0',
        color: theme.palette.text.strong,
        fontWeight: 500,
        textAlign: 'center',
    },
    container: {
        lineHeight: '22px',
        fontWeight: 300,
        '& > div::-webkit-scrollbar': {
            width: '7px',
        },
        '& > div::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '& > div::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: theme.palette.background.default,
        },
    },
    col: {
        color: theme.palette.text.secondary,
        fontWeight: 500,
    },
    content: {
        height: 320,
        overflowY: 'scroll',
        marginTop: 20,
        color: theme.palette.text.strong,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heading: {
        paddingRight: '27px',
    },
}))

export function MyRewards(props: PageInterface) {
    const t = useI18N()
    const { classes } = useStyles()
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const requiredChainId = getRequiredChainId(currentChainId)

    const {
        value: accountRewards,
        loading,
        error,
    } = useAsync(
        async () => (account && currentChainId ? ReferralRPC.getAccountRewards(account, currentChainId) : undefined),
        [account, currentChainId],
    )

    return (
        <ChainBoundary expectedChainId={requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
            <WalletConnectedBoundary>
                <div className={classes.container}>
                    <Grid container justifyContent="space-between" rowSpacing="20px" className={classes.heading}>
                        <Grid item xs={8}>
                            <Typography fontWeight={500} className={classes.col}>
                                {t.reward_tokens()}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography fontWeight={500} className={classes.col}>
                                {t.rewards_earned()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <div className={classes.content}>
                        {loading ? (
                            <LoadingBase size={50} />
                        ) : (
                            <>
                                {!accountRewards || !Object.keys(accountRewards).length || error ? (
                                    <Typography className={classes.msg}>
                                        {error ? t.oracle_error_your_rewards() : t.you_have_not_joined_farm()}
                                    </Typography>
                                ) : (
                                    <Rewards
                                        currentChainId={currentChainId}
                                        account={account}
                                        rewards={accountRewards}
                                        pageType={props.pageType}
                                        onChangePage={props.onChangePage}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </WalletConnectedBoundary>
        </ChainBoundary>
    )
}
