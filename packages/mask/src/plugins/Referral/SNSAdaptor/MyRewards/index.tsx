import { useAsync } from 'react-use'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { Grid, Typography, CircularProgress } from '@mui/material'

import { useI18N } from '../../locales'
import { getRequiredChainId } from '../../helpers'
import type { PageInterface } from '../../types'
import { ReferralRPC } from '../../messages'

import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { Rewards } from './Rewards'

import { useSharedStyles, useMyFarmsStyles } from '../styles'

export function MyRewards(props: PageInterface) {
    const t = useI18N()
    const { classes: sharedClasses } = useSharedStyles()
    const { classes: myFarmsClasses } = useMyFarmsStyles()
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const account = useAccount()

    const {
        value: accountRewards,
        loading,
        error,
    } = useAsync(
        async () => (account && currentChainId ? ReferralRPC.getAccountRewards(account, currentChainId) : undefined),
        [account, currentChainId],
    )

    if (currentChainId !== requiredChainId) {
        return (
            <ChainBoundary expectedChainId={requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
                <WalletConnectedBoundary classes={{ connectWallet: sharedClasses.switchButton }} />
            </ChainBoundary>
        )
    }

    return (
        <div className={myFarmsClasses.container}>
            <Grid container justifyContent="space-between" rowSpacing="20px" className={myFarmsClasses.heading}>
                <Grid item xs={8}>
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t.reward_tokens()}
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t.rewards_earned()}
                    </Typography>
                </Grid>
            </Grid>
            <div className={myFarmsClasses.content}>
                {loading ? (
                    <CircularProgress size={50} />
                ) : (
                    <>
                        {!accountRewards || !Object.keys(accountRewards).length || error ? (
                            <Typography className={sharedClasses.msg}>
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
    )
}
