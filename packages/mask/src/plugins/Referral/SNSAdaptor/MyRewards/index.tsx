import { useAsync } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { useAccount, useChainId } from '@masknet/web3-hooks-base'
import { Grid, Typography } from '@mui/material'

import { useI18N } from '../../locales/index.js'
import { getRequiredChainId } from '../../helpers/index.js'
import type { PageInterface } from '../../types.js'
import { ReferralRPC } from '../../messages.js'

import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary.js'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary.js'
import { Rewards } from './Rewards.js'

import { useSharedStyles, useMyFarmsStyles } from '../styles.js'
import { LoadingBase } from '@masknet/theme'

export function MyRewards(props: PageInterface) {
    const t = useI18N()
    const { classes: sharedClasses } = useSharedStyles()
    const { classes: myFarmsClasses } = useMyFarmsStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const requiredChainId = getRequiredChainId(currentChainId)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

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
                            <LoadingBase size={50} />
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
            </WalletConnectedBoundary>
        </ChainBoundary>
    )
}
