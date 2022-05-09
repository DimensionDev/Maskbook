import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { formatUnits } from '@ethersproject/units'
import { Chip, Grid, InputAdornment, TextField, Typography } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Box } from '@mui/system'
import {
    EthereumTokenType,
    formatBalance,
    useAccount,
    useChainId,
    useFungibleTokenBalance,
    useWeb3,
    FungibleTokenDetailed,
} from '@masknet/web3-shared-evm'

import { AdjustFarmRewardsInterface, TransactionStatus, PagesType, TabsReferralFarms } from '../types'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { roundValue, getRequiredChainId } from '../helpers'
import { APR, ATTRACE_FEE_PERCENT } from '../constants'
import { adjustFarmRewards } from './utils/referralFarm'
import { ReferralRPC } from '../messages'

import { FarmTokenDetailed } from './shared-ui/FarmTokenDetailed'

import { useSharedStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
    valueCol: {
        display: 'flex',
        flexDirection: 'column',
        '& span': { fontWeight: 600, marginTop: '4px' },
    },
    balance: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '80%',
        fontSize: 12,
        top: theme.spacing(0.5),
    },
    textField: {
        '& input[type=number]': {
            height: 30,
            '-moz-appearance': 'textfield',
        },
        '& input[type=number]::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
        '& input[type=number]::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
        },
    },
}))

export function AdjustFarmRewards(props: AdjustFarmRewardsInterface) {
    const { farm, rewardToken, referredToken } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    const { classes: sharedClasses } = useSharedStyles()
    const chainId = useChainId()
    const web3 = useWeb3({ chainId })
    const account = useAccount()
    const { showSnackbar } = useCustomSnackbar()
    const requiredChainId = getRequiredChainId(chainId)
    const { value: rewardBalance = '0' } = useFungibleTokenBalance(
        rewardToken?.type ?? EthereumTokenType.Native,
        rewardToken?.address ?? '',
    )

    const [attraceFee, setAttraceFee] = useState(0)
    const [dailyFarmReward, setDailyFarmReward] = useState('')
    const [totalFarmReward, setTotalFarmReward] = useState('')

    const { value: farmsMetaState } = useAsync(
        async () => (farm?.farmHash ? ReferralRPC.getFarmsMetaState(chainId, [farm.farmHash]) : undefined),
        [farm, chainId],
    )

    const onChangeTotalFarmReward = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const totalFarmReward = e.currentTarget.value
        const attraceFee = Number.parseFloat(totalFarmReward) * (ATTRACE_FEE_PERCENT / 100)

        setTotalFarmReward(totalFarmReward)
        setAttraceFee(attraceFee)
    }, [])

    const onChangePageToAdjustRewards = useCallback(() => {
        props?.onChangePage?.(PagesType.ADJUST_REWARDS, TabsReferralFarms.TOKENS + ': ' + PagesType.ADJUST_REWARDS, {
            adjustFarmDialog: {
                farm,
                rewardToken,
                referredToken,
                continue: () => {},
            },
        })
    }, [props?.onChangePage, farm, rewardToken, referredToken])

    const onErrorDeposit = useCallback(
        (error?: string) => {
            error && showSnackbar(error, { variant: 'error' })
            onChangePageToAdjustRewards()
        },
        [props?.onChangePage, showSnackbar, onChangePageToAdjustRewards],
    )
    const onConfirmedAdjustFarm = useCallback(
        (txHash: string) => {
            props?.onChangePage?.(PagesType.TRANSACTION, t('plugin_referral_transaction'), {
                hideAttrLogo: true,
                hideBackBtn: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMED,
                        actionButton: {
                            label: t('dismiss'),
                            onClick: onChangePageToAdjustRewards,
                        },
                        transactionHash: txHash,
                    },
                },
            })
        },
        [props?.onChangePage, t, onChangePageToAdjustRewards],
    )

    const onConfirmAdjustFarm = useCallback(() => {
        const { title, subtitle } = getTransactionTitles(
            Number.parseFloat(totalFarmReward),
            Number.parseFloat(dailyFarmReward),
            attraceFee,
            props.rewardToken,
        )

        props?.onChangePage?.(PagesType.TRANSACTION, t('plugin_referral_transaction'), {
            hideAttrLogo: true,
            hideBackBtn: true,
            transactionDialog: {
                transaction: {
                    status: TransactionStatus.CONFIRMATION,
                    title,
                    subtitle,
                },
            },
        })
    }, [props, totalFarmReward, dailyFarmReward, attraceFee])

    const onAdjustFarmReward = useCallback(async () => {
        if (!referredToken || !rewardToken) {
            return onErrorDeposit(t('go_wrong'))
        }

        const depositValue = Number.parseFloat(totalFarmReward) + attraceFee

        adjustFarmRewards(
            onConfirmAdjustFarm,
            onErrorDeposit,
            onConfirmedAdjustFarm,
            web3,
            account,
            chainId,
            rewardToken,
            referredToken,
            depositValue,
            Number.parseFloat(dailyFarmReward),
        )
    }, [
        web3,
        account,
        chainId,
        referredToken,
        rewardToken,
        totalFarmReward,
        dailyFarmReward,
        onErrorDeposit,
        onConfirmedAdjustFarm,
        onConfirmAdjustFarm,
    ])

    const onOpenDepositDialog = useCallback(() => {
        props.continue(
            PagesType.ADJUST_REWARDS,
            PagesType.DEPOSIT,
            TabsReferralFarms.TOKENS + ': ' + PagesType.ADJUST_REWARDS,
            {
                hideAttrLogo: true,
                depositDialog: {
                    deposit: {
                        totalFarmReward,
                        token: rewardToken,
                        attraceFee,
                        requiredChainId,
                        onDeposit: onAdjustFarmReward,
                    },
                    adjustFarmData: { farm, referredToken, rewardToken },
                },
            },
        )
    }, [props, attraceFee, totalFarmReward, referredToken, rewardToken, requiredChainId, farm, onAdjustFarmReward])

    const onClickAdjustRewards = useCallback(() => {
        if (totalFarmReward && Number.parseFloat(totalFarmReward) > 0) {
            onOpenDepositDialog()
        } else {
            onAdjustFarmReward()
        }
    }, [totalFarmReward, onOpenDepositDialog, onAdjustFarmReward])

    const getTransactionTitles = useCallback(
        (totalFarmReward: number, dailyFarmReward: number, attraceFee: number, rewardToken?: FungibleTokenDetailed) => {
            totalFarmReward = roundValue(totalFarmReward + attraceFee, rewardToken?.decimals)
            dailyFarmReward = roundValue(dailyFarmReward, rewardToken?.decimals)

            if (totalFarmReward && dailyFarmReward) {
                return {
                    title: t('plugin_referral_confirm_transaction'),
                    subtitle: t('plugin_referral_adjust_daily_and_total_reward_desc', {
                        totalReward: totalFarmReward,
                        dailyReward: dailyFarmReward,
                        symbol: rewardToken?.symbol ?? '',
                    }),
                }
            }

            if (totalFarmReward) {
                return {
                    title: t('plugin_referral_confirm_deposit'),
                    subtitle: t('plugin_referral_adjust_total_reward_desc', {
                        reward: totalFarmReward,
                        symbol: rewardToken?.symbol ?? '',
                    }),
                }
            }

            return {
                title: t('plugin_referral_confirm_transaction'),
                subtitle: t('plugin_referral_adjust_daily_reward_desc', {
                    reward: dailyFarmReward,
                    symbol: rewardToken?.symbol ?? '',
                }),
            }
        },
        [t],
    )

    const farmMetaState = farm?.farmHash ? farmsMetaState?.get(farm.farmHash) : undefined
    const rewardData = {
        apr: APR,
        dailyReward: roundValue(formatUnits(farmMetaState?.dailyFarmReward ?? '0', rewardToken?.decimals)),
        totalReward: roundValue(farm?.totalFarmRewards ?? '0'),
    }

    const balance = formatBalance(rewardBalance ?? '', rewardToken?.decimals, 6)
    const totalFarmRewardNum = Number.parseFloat(totalFarmReward)
    const insufficientFunds = totalFarmRewardNum > Number.parseFloat(balance)
    const adjustRewardsBtnDisabled = (!Number.parseFloat(dailyFarmReward) && !totalFarmRewardNum) || insufficientFunds

    return rewardToken ? (
        <Box display="flex" flexDirection="column">
            <Grid container marginY={3}>
                <Grid item marginBottom="24px">
                    <Typography fontWeight={600} variant="h6">
                        {t('plugin_referral_adjust_rewards_desc')}
                    </Typography>
                </Grid>
                <Grid item marginBottom="24px">
                    <FarmTokenDetailed token={referredToken} />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="space-between" marginBottom="24px">
                    <Grid item xs={4} className={classes.valueCol}>
                        {t('plugin_referral_estimated_apr')}
                        <span>{rewardData.apr}</span>
                    </Grid>
                    <Grid item xs={4} className={classes.valueCol}>
                        {t('plugin_referral_daily_farm_reward')}
                        <span>{rewardData ? `${rewardData.dailyReward} ${rewardToken?.symbol ?? '-'}` : '-'}</span>
                    </Grid>
                    <Grid item xs={4} className={classes.valueCol}>
                        {t('plugin_referral_total_farm_rewards')}
                        <span> {rewardData ? `${rewardData.totalReward} ${rewardToken?.symbol ?? '-'}` : '-'}</span>
                    </Grid>
                </Grid>
                <Grid item xs={6} display="flex">
                    <TextField
                        label={t('plugin_referral_daily_farm_reward')}
                        value={dailyFarmReward}
                        placeholder={rewardData.dailyReward.toString()}
                        onChange={(e) => setDailyFarmReward(e.currentTarget.value)}
                        inputMode="numeric"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="standard"
                        className={classes.textField}
                        InputProps={{
                            disableUnderline: true,
                            endAdornment: <InputAdornment position="end">{rewardToken?.symbol}</InputAdornment>,
                        }}
                    />
                </Grid>
                <Grid item xs={6} display="flex" alignItems="end">
                    <TextField
                        label={t('plugin_referral_additional_farm_rewards')}
                        value={totalFarmReward}
                        inputMode="numeric"
                        type="number"
                        placeholder="0"
                        onChange={onChangeTotalFarmReward}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="standard"
                        className={classes.textField}
                        InputProps={{
                            disableUnderline: true,
                            endAdornment: (
                                <InputAdornment position="start">
                                    <Box>
                                        <Typography
                                            className={classes.balance}
                                            color="textSecondary"
                                            variant="body2"
                                            component="span">
                                            {t('wallet_balance')}: {balance}
                                        </Typography>
                                        <Box display="flex" alignItems="center">
                                            {rewardToken?.symbol}
                                            <Chip
                                                size="small"
                                                label="MAX"
                                                clickable
                                                color="primary"
                                                className={sharedClasses.maxChip}
                                                variant="outlined"
                                                onClick={() => setTotalFarmReward(balance)}
                                            />
                                        </Box>
                                    </Box>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} marginTop="24px">
                    <EthereumChainBoundary
                        chainId={requiredChainId}
                        noSwitchNetworkTip
                        classes={{ switchButton: sharedClasses.switchButton }}>
                        <ActionButton
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={adjustRewardsBtnDisabled}
                            onClick={onClickAdjustRewards}>
                            {insufficientFunds
                                ? t('plugin_referral_error_insufficient_balance', { symbol: rewardToken?.symbol })
                                : t('plugin_referral_adjust_rewards')}
                        </ActionButton>
                    </EthereumChainBoundary>
                </Grid>
            </Grid>
        </Box>
    ) : (
        <Typography fontWeight={500} variant="h6" textAlign="center" padding={8}>
            {t('plugin_referral_adjust_rewards_error')}
        </Typography>
    )
}
