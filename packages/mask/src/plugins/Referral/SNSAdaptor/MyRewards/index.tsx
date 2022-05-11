import { useAsync } from 'react-use'
import { useAccount, useChainId, useTokenListConstants, useWeb3 } from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Grid, Typography, CircularProgress } from '@mui/material'

import { useI18N } from '../../../../utils'
import { getRequiredChainId } from '../../helpers'
import type { PageInterface } from '../../types'
import { ReferralRPC } from '../../messages'
import { filterRewardsByAccountTokenPeriodOffset } from '../utils/rewards'

import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { Rewards } from './Rewards'

import { useSharedStyles, useMyFarmsStyles } from '../styles'

export function MyRewards(props: PageInterface) {
    const { t } = useI18N()
    const { classes: sharedClasses } = useSharedStyles()
    const { classes: myFarmsClasses } = useMyFarmsStyles()
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const account = useAccount()
    const { ERC20 } = useTokenListConstants()
    const web3 = useWeb3({ chainId: requiredChainId })

    const {
        value: accountRewards,
        loading,
        error: accountRewardsError,
    } = useAsync(
        async () => (account && ERC20 ? ReferralRPC.getAccountRewards(account, currentChainId, ERC20) : undefined),
        [account, currentChainId, ERC20],
    )

    // filter out the periods that oracle might still need to pick up
    const {
        value: rewardsFiltered = EMPTY_LIST,
        loading: loadingOffsets,
        error: rewardsFilteredError,
    } = useAsync(
        async () => account && filterRewardsByAccountTokenPeriodOffset(web3, account, accountRewards),
        [account, accountRewards, web3],
    )

    if (currentChainId !== requiredChainId) {
        return (
            <EthereumChainBoundary
                chainId={requiredChainId}
                noSwitchNetworkTip
                classes={{ switchButton: sharedClasses.switchButton }}
            />
        )
    }

    const error = accountRewardsError || rewardsFilteredError
    return (
        <div className={myFarmsClasses.container}>
            <Grid container justifyContent="space-between" rowSpacing="20px" className={myFarmsClasses.heading}>
                <Grid item xs={8}>
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t('plugin_referral_reward_tokens')}
                    </Typography>
                </Grid>
                <Grid item xs={4} paddingLeft="12px">
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t('plugin_referral_rewards_earned')}
                    </Typography>
                </Grid>
            </Grid>
            <div className={myFarmsClasses.content}>
                {loading || loadingOffsets ? (
                    <CircularProgress size={50} />
                ) : (
                    <>
                        {!rewardsFiltered || !rewardsFiltered.length || error ? (
                            <Typography className={sharedClasses.msg}>
                                {error
                                    ? t('plugin_referral_oracle_error_your_rewards')
                                    : t('plugin_referral_you_have_not_joined_farm')}
                            </Typography>
                        ) : (
                            <Rewards
                                currentChainId={currentChainId}
                                account={account}
                                rewards={rewardsFiltered}
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
