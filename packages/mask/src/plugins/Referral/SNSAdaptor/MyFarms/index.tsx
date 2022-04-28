import { useAsync } from 'react-use'
import { useAccount, useChainId, useTokenListConstants } from '@masknet/web3-shared-evm'
import { Grid, Typography, CircularProgress } from '@mui/material'

import { useI18N } from '../../../../utils'
import { getRequiredChainId } from '../../helpers'
import type { PageInterface } from '../../types'
import { fetchERC20TokensFromTokenListsMap } from '../utils/tokenLists'
import { ReferralRPC } from '../../messages'

import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { FarmList } from './farmList'

import { useSharedStyles, useMyFarmsStyles } from '../styles'

export function MyFarms(props: PageInterface) {
    const { t } = useI18N()
    const { classes: sharedClasses } = useSharedStyles()
    const { classes: myFarmsClasses } = useMyFarmsStyles()
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const account = useAccount()
    const { ERC20 } = useTokenListConstants()

    const { value: rewards, loading: loadingRewards } = useAsync(
        async () => account && ReferralRPC.getAccountRewards(account, currentChainId),
        [account, currentChainId],
    )

    const { value: allTokens, loading: loadingAllTokens } = useAsync(
        async () =>
            !ERC20 || ERC20.length === 0 ? undefined : fetchERC20TokensFromTokenListsMap(ERC20, currentChainId),
        [currentChainId, ERC20],
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

    return (
        <div className={myFarmsClasses.container}>
            <Grid container justifyContent="space-between" rowSpacing="20px" className={myFarmsClasses.heading}>
                <Grid item xs={6}>
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t('plugin_referral_referral_farm')}
                    </Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t('plugin_referral_apr')}
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography fontWeight={500} className={myFarmsClasses.col}>
                        {t('plugin_referral_rewards_earned')}
                    </Typography>
                </Grid>
            </Grid>
            <div className={myFarmsClasses.content}>
                {loadingRewards || loadingAllTokens ? (
                    <CircularProgress size={50} />
                ) : (
                    <>
                        {!rewards ? (
                            <Typography className={myFarmsClasses.noFarm}>
                                {t('plugin_referral_you_have_not_joined_farm')}
                            </Typography>
                        ) : (
                            <FarmList
                                currentChainId={currentChainId}
                                account={account}
                                rewards={rewards}
                                allTokens={allTokens}
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
