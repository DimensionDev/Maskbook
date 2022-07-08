import { useAsync } from 'react-use'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Grid, Typography, CircularProgress, Box, Button } from '@mui/material'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'

import { useI18N } from '../locales'
import { PageInterface, PagesType, FarmDetailed } from '../types'
import { getRequiredChainId } from '../helpers'
import { ReferralRPC } from '../messages'

import { AccordionFarm } from './shared-ui/AccordionFarm'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

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
    error?: Error
    onAdjustRewardButtonClick: (farm: FarmDetailed) => void
}
function FarmList({ loading, error, farms, onAdjustRewardButtonClick }: FarmListProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const { classes: sharedClasses } = useSharedStyles()

    if (loading) return <CircularProgress size={50} />

    if (error) return <Typography className={sharedClasses.msg}>{t.blockchain_error_referral_farms()}</Typography>

    if (!farms.length) return <Typography className={sharedClasses.msg}>{t.no_created_farm()}</Typography>

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
                                {t.view_stats()}
                            </Button>
                            <Button
                                disabled
                                size="medium"
                                className={classes.buttonWithdraw}
                                onClick={() => console.log('request to withdraw')}>
                                {t.request_to_withdraw()}
                            </Button>
                            <Button
                                size="medium"
                                onClick={() => {
                                    onAdjustRewardButtonClick(farm)
                                }}>
                                {t.adjust_rewards()}
                            </Button>
                        </Box>
                    </AccordionFarm>
                )
            })}
        </>
    )
}

export function CreatedFarms(props: PageInterface) {
    const t = useI18N()
    const { classes: myFarmsClasses } = useMyFarmsStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const requiredChainId = getRequiredChainId(currentChainId)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const {
        value: farms = EMPTY_LIST,
        loading,
        error,
    } = useAsync(
        async () => (account ? ReferralRPC.getAccountFarms(account, currentChainId) : []),
        [currentChainId, account],
    )

    const onAdjustRewardButtonClick = (farm: FarmDetailed) => {
        props.continue(PagesType.CREATE_FARM, PagesType.ADJUST_REWARDS, t.adjust_rewards(), {
            adjustFarmDialog: {
                farm,
                rewardToken: farm.rewardToken,
                referredToken: farm.referredToken,
                continue: () => {},
            },
        })
    }

    return (
        <ChainBoundary expectedChainId={requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
            <WalletConnectedBoundary offChain>
                <div className={myFarmsClasses.container}>
                    <Grid container justifyContent="space-between" rowSpacing="20px" className={myFarmsClasses.heading}>
                        <Grid item xs={8} className={myFarmsClasses.col}>
                            {t.referral_farm()}
                        </Grid>
                        <Grid item xs={4} className={myFarmsClasses.col}>
                            {t.total_rewards()}
                        </Grid>
                    </Grid>
                    <div className={myFarmsClasses.content}>
                        <FarmList
                            loading={loading}
                            error={error}
                            farms={farms}
                            onAdjustRewardButtonClick={onAdjustRewardButtonClick}
                        />
                    </div>
                </div>
            </WalletConnectedBoundary>
        </ChainBoundary>
    )
}
