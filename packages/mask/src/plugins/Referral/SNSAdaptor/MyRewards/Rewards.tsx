import { useCallback } from 'react'
import { formatUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'
import type { ChainId, Web3 } from '@masknet/web3-shared-evm'
import { useWeb3 } from '@masknet/plugin-infra/web3'
import { useCustomSnackbar } from '@masknet/theme'
import { Typography, Button, Box } from '@mui/material'

import { useI18N } from '../../locales'
import { roundValue } from '../../helpers'
import { harvestRewards } from '../utils/rewards'
import { PagesType, TransactionStatus, AccountRewards, RewardDetailed, ChangePage } from '../../types'

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
    const t = useI18N()
    const web3 = useWeb3()
    const { showSnackbar } = useCustomSnackbar()

    const onStartHarvestRewards = useCallback(
        (totalRewards: number, rewardTokenSymbol?: string) => {
            onChangePage?.(PagesType.TRANSACTION, t.transaction(), {
                hideBackBtn: true,
                hideAttrLogo: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMATION,
                        title: t.confirm_transaction(),
                        subtitle: t.confirm_transaction_harvesting({
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
            onChangePage?.(PagesType.TRANSACTION, t.transaction(), {
                hideBackBtn: true,
                hideAttrLogo: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMED,
                        actionButton: {
                            label: t.dismiss(),
                            onClick: () => onChangePage?.(pageType, pageType),
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
            showSnackbar(error || t.go_wrong(), { variant: 'error' })
            onChangePage?.(pageType, pageType)
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
                web3 as Web3,
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
                let totalRewards = new BigNumber(0)
                let claimed = new BigNumber(0)

                for (const reward of rewardTokenRewards) {
                    totalRewards = totalRewards.plus(
                        new BigNumber(formatUnits(reward.rewardValue, reward.rewardToken?.decimals)),
                    )
                    claimed = claimed.plus(
                        new BigNumber(
                            reward.claimed ? formatUnits(reward.rewardValue, reward.rewardToken?.decimals) : 0,
                        ),
                    )
                }

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
                                    <span style={{ marginRight: '4px' }}>{t.claimable()}:</span>{' '}
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
                                    {t.harvest_rewards()}
                                </Button>
                            </Box>
                        </Box>
                    </AccordionReward>
                )
            })}
        </>
    )
}
