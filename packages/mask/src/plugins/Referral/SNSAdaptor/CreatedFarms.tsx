import { useAsync } from 'react-use'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { getMaskColor, LoadingBase, makeStyles } from '@masknet/theme'
import { Grid, Typography, Box, Button } from '@mui/material'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'

import { useI18N } from '../locales/index.js'
import { PageInterface, PagesType, FarmDetailed } from '../types.js'
import { getRequiredChainId } from '../helpers/index.js'
import { ReferralRPC } from '../messages.js'

import { AccordionFarm } from './shared-ui/AccordionFarm.js'
import { WalletConnectedBoundary, ChainBoundary } from '@masknet/shared'

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

type FarmListProps = {
    farms: FarmDetailed[]
    loading: boolean
    error?: Error
    onAdjustRewardButtonClick: (farm: FarmDetailed) => void
}
function FarmList({ loading, error, farms, onAdjustRewardButtonClick }: FarmListProps) {
    const t = useI18N()
    const { classes } = useStyles()

    if (loading) return <LoadingBase size={50} />

    if (error) return <Typography className={classes.msg}>{t.blockchain_error_referral_farms()}</Typography>

    if (!farms.length) return <Typography className={classes.msg}>{t.no_created_farm()}</Typography>

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
    const { classes } = useStyles()
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const requiredChainId = getRequiredChainId(currentChainId)
    const { Others } = useWeb3State()

    const {
        value: farms = EMPTY_LIST,
        loading,
        error,
    } = useAsync(
        async () =>
            account && Others?.chainResolver.isValid(currentChainId)
                ? ReferralRPC.getAccountFarms(account, currentChainId)
                : [],
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
                <div className={classes.container}>
                    <Grid container justifyContent="space-between" rowSpacing="20px" className={classes.heading}>
                        <Grid item xs={8} className={classes.col}>
                            {t.referral_farm()}
                        </Grid>
                        <Grid item xs={4} className={classes.col}>
                            {t.total_rewards()}
                        </Grid>
                    </Grid>
                    <div className={classes.content}>
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
