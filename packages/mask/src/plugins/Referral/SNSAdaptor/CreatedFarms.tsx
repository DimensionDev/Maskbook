import { useAsync } from 'react-use'
import {
    useAccount,
    useChainId,
    useTokenListConstants,
    useNativeTokenDetailed,
    ERC20TokenDetailed,
    ChainId,
} from '@masknet/web3-shared-evm'
import { formatUnits } from '@ethersproject/units'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Grid, Typography, CircularProgress, Box, Button } from '@mui/material'
import { TokenList } from '@masknet/web3-providers'

import { useI18N } from '../../../utils'
import { farmsService } from '../Worker/services'
import { FarmDepositChange, FarmExistsEvent, PageInterface, PagesType, TabsReferralFarms } from '../types'
import { toNativeRewardTokenDefn, parseChainAddress } from '../helpers'
import { useRequiredChainId } from '../hooks/useRequiredChainId'

import { AccordionFarm } from './shared-ui/AccordionFarm'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

import { useSharedStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
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
    noFarm: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: theme.palette.background.default,
        height: '44px',
        color: theme.palette.text.strong,
        fontWeight: 500,
    },
    total: {
        marginRight: '4px',
    },
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

interface Farm extends FarmExistsEvent {
    totalFarmRewards?: number
    dailyFarmReward?: number
    apr?: number
}
function groupDepositForFarms(
    myFarms: FarmExistsEvent[],
    farmsDeposits: FarmDepositChange[],
    allTokensMap: Map<string, ERC20TokenDetailed>,
) {
    const farms: Farm[] = []
    const farmTotalDepositMap = new Map<string, number>()
    const allFarmsMap = new Map(myFarms.map((farm) => [farm.farmHash, farm]))

    farmsDeposits.forEach((deposit) => {
        const { farmHash, delta } = deposit
        const prevFarmState = farmTotalDepositMap.get(farmHash) || 0
        const farm = allFarmsMap.get(farmHash)
        const rewardTokenAddr = farm?.rewardTokenDefn && parseChainAddress(farm.rewardTokenDefn).address
        const rewardTokenDec = rewardTokenAddr ? allTokensMap.get(rewardTokenAddr)?.decimals : 18
        const totalFarmRewards = prevFarmState + Number(formatUnits(delta.toString(), rewardTokenDec))
        farmTotalDepositMap.set(farmHash, totalFarmRewards)
    })

    myFarms.forEach((farm) => {
        farms.push({ totalFarmRewards: farmTotalDepositMap.get(farm.farmHash) || 0, ...farm })
    })

    return farms
}

type TCreatedFarmsContent = {
    currentChainId: ChainId
    farms: Farm[]
    loading: boolean
    allTokensMap: Map<string, ERC20TokenDetailed>
    onAdjustRewardButtonClick: (farm: Farm) => void
}
function CreatedFarmsContent({
    currentChainId,
    farms,
    loading,
    onAdjustRewardButtonClick,
    allTokensMap,
}: TCreatedFarmsContent) {
    const { t } = useI18N()
    const { classes } = useStyles()

    if (loading) return <CircularProgress size={50} />

    if (!farms.length) return <Typography className={classes.noFarm}>{t('plugin_referral_no_created_farm')}</Typography>

    return (
        <>
            {farms.map((farm) => (
                <AccordionFarm
                    key={farm.farmHash}
                    farm={farm}
                    allTokensMap={allTokensMap}
                    totalValue={Number.parseFloat(farm?.totalFarmRewards?.toFixed(5) ?? '0')}
                    accordionDetails={
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
                                    onAdjustRewardButtonClick({ ...farm })
                                }}>
                                {t('plugin_referral_adjust_rewards')}
                            </Button>
                        </Box>
                    }
                />
            ))}
        </>
    )
}

export function CreatedFarms(props: PageInterface) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { classes: sharedClasses } = useSharedStyles()
    const currentChainId = useChainId()
    const requiredChainId = useRequiredChainId(currentChainId)
    const account = useAccount()
    const { ERC20 } = useTokenListConstants()
    const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
        async () =>
            !ERC20 || ERC20.length === 0 ? [] : TokenList.fetchERC20TokensFromTokenLists(ERC20, currentChainId),
        [currentChainId, ERC20?.sort().join()],
    )
    const { value: nativeToken } = useNativeTokenDetailed()

    // fetch my farms
    const { value: myFarms = [], loading: loadingMyFarms } = useAsync(
        async () => farmsService.getMyFarms(account, currentChainId),
        [currentChainId, account],
    )

    // fetch all deposits
    const { value: farmsDeposits = [], loading: loadingFarmsDeposits } = useAsync(
        async () => farmsService.getFarmsDeposits(currentChainId),
        [currentChainId],
    )

    const allTokensMap = new Map(allTokens.map((token) => [token.address.toLowerCase(), token]))
    const farms = groupDepositForFarms(myFarms, farmsDeposits, allTokensMap)

    const onAdjustRewardButtonClick = (farm: Farm) => {
        const nativeRewardToken = toNativeRewardTokenDefn(currentChainId)

        const rewardToken =
            farm.rewardTokenDefn === nativeRewardToken
                ? nativeToken
                : allTokensMap.get(parseChainAddress(farm.rewardTokenDefn).address)
        const referredToken = allTokensMap.get(parseChainAddress(farm.referredTokenDefn).address)

        props.continue(
            PagesType.CREATE_FARM,
            PagesType.ADJUST_REWARDS,
            `${TabsReferralFarms.TOKENS}: ${t('plugin_referral_adjust_rewards')}`,
            {
                adjustFarmDialog: {
                    farm,
                    rewardToken,
                    referredToken,
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
        <div className={classes.container}>
            <Grid container justifyContent="space-between" rowSpacing="20px" className={classes.heading}>
                <Grid item xs={6} className={classes.col}>
                    {t('plugin_referral_referral_farm')}
                </Grid>
                <Grid item xs={2} className={classes.col}>
                    {t('plugin_referral_apr')}
                </Grid>
                <Grid item xs={4} className={classes.col}>
                    {t('plugin_referral_total_rewards')}
                </Grid>
            </Grid>
            <div className={classes.content}>
                <CreatedFarmsContent
                    currentChainId={currentChainId}
                    loading={loadingMyFarms || loadingFarmsDeposits || loadingAllTokens}
                    farms={farms}
                    allTokensMap={allTokensMap}
                    onAdjustRewardButtonClick={onAdjustRewardButtonClick}
                />
            </div>
        </div>
    )
}
