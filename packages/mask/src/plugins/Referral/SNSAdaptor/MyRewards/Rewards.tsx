import { useCallback } from 'react'
import { formatUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'
import { useWeb3, type ChainId } from '@masknet/web3-shared-evm'
import { useCustomSnackbar } from '@masknet/theme'
import { Typography, Button, Box } from '@mui/material'

import { useI18N } from '../../../../utils'
import { roundValue } from '../../helpers'
import { harvestRewards } from '../utils/referralFarm'
import {
    PagesType,
    TransactionStatus,
    TabsReferralFarms,
    AccountRewards,
    RewardDetailed,
    ChangePage,
} from '../../types'

import { AccordionReward } from './AccordionReward'
import { ReferredTokenRewards } from './ReferredTokenRewards'

interface RewardsProps {
    currentChainId: ChainId
    account: string
    rewards: AccountRewards
    pageType?: PagesType
    onChangePage?: ChangePage
}

export function Rewards({
    currentChainId,
    account,
    rewards,
    pageType = PagesType.REFERRAL_FARMS,
    onChangePage,
}: RewardsProps) {
    const { t } = useI18N()
    const web3 = useWeb3({ chainId: currentChainId })
    const { showSnackbar } = useCustomSnackbar()

    const onStartHarvestRewards = useCallback(
        (totalRewards: number, rewardTokenSymbol?: string) => {
            onChangePage?.(PagesType.TRANSACTION, t('plugin_referral_transaction'), {
                hideBackBtn: true,
                hideAttrLogo: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMATION,
                        title: t('plugin_referral_confirm_transaction'),
                        subtitle: t('plugin_referral_confirm_transaction_harvesting', {
                            reward: totalRewards.toFixed(4),
                            symbol: rewardTokenSymbol ?? '',
                        }),
                    },
                },
            })
        },
        [onChangePage],
    )

    const onConfirmHarvestRewards = useCallback(
        (txHash: string) => {
            onChangePage?.(PagesType.TRANSACTION, t('plugin_referral_transaction'), {
                hideBackBtn: true,
                hideAttrLogo: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMED,
                        actionButton: {
                            label: t('dismiss'),
                            onClick: () => onChangePage?.(pageType, TabsReferralFarms.TOKENS + ': ' + pageType),
                        },
                        transactionHash: txHash,
                    },
                },
            })
        },
        [onChangePage, t],
    )

    const onErrorHarvestRewards = useCallback(
        (error?: string) => {
            showSnackbar(error || t('go_wrong'), { variant: 'error' })
            onChangePage?.(pageType, TabsReferralFarms.TOKENS + ': ' + pageType)
        },
        [onChangePage, t, showSnackbar],
    )

    const onHarvestRewards = useCallback(
        async (
            rewards: RewardDetailed[],
            totalRewards: number,
            rewardTokenDefn: string,
            rewardTokenSymbol?: string,
        ) => {
            const rewardsClaimable = rewards.filter((reward) => !reward.claimed)
            harvestRewards(
                onConfirmHarvestRewards,
                () => onStartHarvestRewards(totalRewards, rewardTokenSymbol),
                onErrorHarvestRewards,
                web3,
                account,
                rewardsClaimable,
                rewardTokenDefn,
            )
        },
        [web3, account, currentChainId],
    )

    return (
        <>
            {Object.entries(rewards).map(([rewardTokenDefn, rewardTokenRewards]) => {
                const totalRewards = rewardTokenRewards.reduce(function (accumulator, current) {
                    return accumulator.plus(new BigNumber(formatUnits(current.rewardValue)))
                }, new BigNumber(0))
                const claimed = rewardTokenRewards.reduce(function (accumulator, current) {
                    return accumulator.plus(new BigNumber(current.claimed ? formatUnits(current.rewardValue) : 0))
                }, new BigNumber(0))
                const claimable = totalRewards.minus(claimed).toNumber()
                const rewardToken = rewardTokenRewards[0].rewardToken

                return (
                    <AccordionReward
                        key={rewardTokenDefn}
                        rewardToken={rewardToken}
                        totalValue={totalRewards.toNumber()}>
                        <Box display="flex" flexDirection="column">
                            <ReferredTokenRewards rewards={rewardTokenRewards} />
                            <Box display="flex" justifyContent="flex-end" marginTop="4px">
                                <Typography display="flex" alignItems="center" marginRight="20px" fontWeight={600}>
                                    <span style={{ marginRight: '4px' }}>{t('plugin_referral_claimable')}:</span>{' '}
                                    {roundValue(claimable, rewardToken?.decimals)} {rewardToken?.symbol}
                                </Typography>
                                <Button
                                    disabled={claimable <= 0}
                                    variant="contained"
                                    size="medium"
                                    onClick={() =>
                                        onHarvestRewards(
                                            rewardTokenRewards,
                                            totalRewards.toNumber(),
                                            rewardTokenDefn,
                                            rewardToken?.symbol,
                                        )
                                    }>
                                    {t('plugin_referral_harvest_rewards')}
                                </Button>
                            </Box>
                        </Box>
                    </AccordionReward>
                )
            })}
        </>
    )
}
