import { useAsync } from 'react-use'
import { useAccount, useChainId, useTokenListConstants } from '@masknet/web3-shared-evm'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Grid, Typography, CircularProgress, Box, Button } from '@mui/material'
import { EMPTY_LIST } from '@masknet/shared-base'

import { useI18N } from '../../../utils'
import { PageInterface, PagesType, TabsReferralFarms, FarmDetailed } from '../types'
import { getRequiredChainId } from '../helpers'
import { ReferralRPC } from '../messages'

import { AccordionFarm } from './shared-ui/AccordionFarm'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

import { useSharedStyles, useMyFarmsStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
    buttonWithdraw: {
        background: getMaskColor(theme).redMain,
        marginRight: '12px',
        ':hover': {
            background: getMaskColor(theme).redMain,
        },
    },
    viewStatsDisabled: {
        marginRight: '8px',
    },
}))

type FarmListProps = {
    farms: FarmDetailed[]
    loading: boolean
    onAdjustRewardButtonClick: (farm: FarmDetailed) => void
}
function FarmList({ loading, farms, onAdjustRewardButtonClick }: FarmListProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { classes: myFarmsClasses } = useMyFarmsStyles()

    if (loading) return <CircularProgress size={50} />

    if (!farms.length)
        return <Typography className={myFarmsClasses.noFarm}>{t('plugin_referral_no_created_farm')}</Typography>

    return (
        <>
            {farms.map((farm) => {
                return (
                    <AccordionFarm
                        key={farm.farmHash}
                        rewardToken={farm.rewardToken}
                        referredToken={farm.referredToken}
                        totalValue={Number.parseFloat(farm?.totalFarmRewards?.toFixed(5) ?? '0')}>
                        <Box display="flex" justifyContent="flex-end">
                            <Button variant="text" disabled classes={{ disabled: classes.viewStatsDisabled }}>
                                {t('plugin_referral_view_stats')}
                            </Button>
                            <Button
                                disabled
                                variant="contained"
                                size="medium"
                                className={classes.buttonWithdraw}
                                onClick={() => console.log('request to withdraw')}>
                                {t('plugin_referral_request_to_withdraw')}
                            </Button>
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => {
                                    onAdjustRewardButtonClick(farm)
                                }}>
                                {t('plugin_referral_adjust_rewards')}
                            </Button>
                        </Box>
                    </AccordionFarm>
                )
            })}
        </>
    )
}

export function CreatedFarms(props: PageInterface) {
    const { t } = useI18N()
    const { classes: sharedClasses } = useSharedStyles()
    const { classes: myFarmsClasses } = useMyFarmsStyles()
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const account = useAccount()
    const { ERC20 } = useTokenListConstants()

    const { value: farms = EMPTY_LIST, loading } = useAsync(
        async () => (account ? ReferralRPC.getAccountFarms(account, currentChainId, ERC20) : []),
        [currentChainId, account, ERC20],
    )

    const onAdjustRewardButtonClick = (farm: FarmDetailed) => {
        props.continue(
            PagesType.CREATE_FARM,
            PagesType.ADJUST_REWARDS,
            `${TabsReferralFarms.TOKENS}: ${t('plugin_referral_adjust_rewards')}`,
            {
                adjustFarmDialog: {
                    farm,
                    rewardToken: farm.rewardToken,
                    referredToken: farm.referredToken,
                    continue: () => {},
                },
            },
        )
    }

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
                <Grid item xs={6} className={myFarmsClasses.col}>
                    {t('plugin_referral_referral_farm')}
                </Grid>
                <Grid item xs={2} className={myFarmsClasses.col}>
                    {t('plugin_referral_apr')}
                </Grid>
                <Grid item xs={4} className={myFarmsClasses.col}>
                    {t('plugin_referral_total_rewards')}
                </Grid>
            </Grid>
            <div className={myFarmsClasses.content}>
                <FarmList loading={loading} farms={farms} onAdjustRewardButtonClick={onAdjustRewardButtonClick} />
            </div>
        </div>
    )
}
