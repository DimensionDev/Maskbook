import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { FungibleTokenDetailed, useAccount, useChainId, useWeb3, useTokenListConstants } from '@masknet/web3-shared-evm'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Typography, Box, Tab, Tabs, Grid, Divider } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { v4 as uuid } from 'uuid'
import { EMPTY_LIST } from '@masknet/shared-base'

import { useI18N } from '../locales'
import { PluginReferralMessages, SelectTokenUpdated, ReferralRPC } from '../messages'
import { PluginTraderMessages } from '../../Trader/messages'

import { getRequiredChainId } from '../helpers'
import { singAndPostProofOfRecommendationWithReferrer } from './utils/proofOfRecommendation'
import { MASK_REFERRER, SWAP_CHAIN_ID } from '../constants'
import { TabsReferAndBuy, TransactionStatus, PageInterface, PagesType } from '../types'
import type { Coin } from '../../Trader/types'

import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { MyRewards } from './MyRewards'
import { TokenSelectField } from './shared-ui/TokenSelectField'
import { RewardDataWidget } from './shared-ui/RewardDataWidget'
import { SponsoredFarmIcon } from './shared-ui/icons/SponsoredFarm'

import { useTabStyles, useSharedStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'auto',
        padding: theme.spacing(3, 0),
    },
    tabs: {
        width: '288px',
    },
    subtitle: {
        margin: '12px 0 24px',
    },
    typeNote: {
        marginBottom: '24px',
        '& b': {
            margin: '0 4px 0 8px',
            fontWeight: 600,
        },
    },
}))

export function BuyToFarm(props: PageInterface) {
    const t = useI18N()
    const { classes } = useStyles()
    const { classes: tabClasses } = useTabStyles()
    const { classes: sharedClasses } = useSharedStyles()
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const web3 = useWeb3()
    const account = useAccount()
    const { showSnackbar } = useCustomSnackbar()
    const { ERC20 } = useTokenListConstants()

    const [tab, setTab] = useState(TabsReferAndBuy.NEW)
    const [id] = useState(uuid())
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        PluginReferralMessages.selectTokenUpdated,
        useCallback(
            (ev: SelectTokenUpdated) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id, setToken],
        ),
    )
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const { value: tokenRewards = EMPTY_LIST, loading } = useAsync(
        async () =>
            token?.address && ERC20
                ? ReferralRPC.getRewardsForReferredToken(currentChainId, token.address, ERC20)
                : EMPTY_LIST,
        [token?.address, currentChainId, ERC20],
    )

    const onClickTokenSelect = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            title: t.select_a_token_to_buy_and_hold(),
            onlyFarmTokens: true,
        })
    }, [id])

    const swapToken = useCallback(() => {
        if (!token) {
            showSnackbar(t.error_token_not_select(), { variant: 'error' })
            return
        }
        openSwapDialog({
            open: true,
            traderProps: {
                chainId: SWAP_CHAIN_ID,
                coin: {
                    id: token?.address,
                    name: token?.name ?? '',
                    symbol: token?.symbol ?? '',
                    contract_address: token?.address,
                    decimals: token?.decimals,
                } as Coin,
            },
        })
    }, [token, openSwapDialog])

    const onConfirmReferFarm = useCallback(() => {
        props?.onChangePage?.(PagesType.TRANSACTION, t.transaction(), {
            hideAttrLogo: true,
            hideBackBtn: true,
            transactionDialog: {
                transaction: {
                    status: TransactionStatus.CONFIRMATION,
                    title: t.transaction_complete_signature_request(),
                    subtitle: t.transaction_sign_the_message_to_register_address_for_rewards(),
                },
            },
        })
    }, [props?.onChangePage, t])

    const onError = useCallback(
        (error?: string) => {
            showSnackbar(error || t.go_wrong(), { variant: 'error' })
            props?.onChangePage?.(PagesType.BUY_TO_FARM, PagesType.BUY_TO_FARM)
        },
        [props?.onChangePage, t, showSnackbar],
    )

    const onClickBuyToFarm = useCallback(async () => {
        if (!token?.address) {
            return onError(t.error_token_not_select())
        }

        try {
            onConfirmReferFarm()
            await singAndPostProofOfRecommendationWithReferrer(web3, account, token.address, MASK_REFERRER)
            props?.onChangePage?.(PagesType.BUY_TO_FARM, PagesType.BUY_TO_FARM)
            swapToken()
        } catch (error: any) {
            onError(error?.message)
        }
    }, [props?.onChangePage, web3, account, token])

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <Tabs
                    value={tab}
                    centered
                    variant="fullWidth"
                    onChange={(e, v) => setTab(v)}
                    aria-label="persona-post-contacts-button-group">
                    <Tab value={TabsReferAndBuy.NEW} label={t.tab_new()} classes={tabClasses} />
                    <Tab value={TabsReferAndBuy.MY_REWARDS} label={t.tab_my_rewards()} classes={tabClasses} />
                </Tabs>
                <TabPanel value={TabsReferAndBuy.NEW} className={classes.tab}>
                    <Typography fontWeight={600} variant="h6" marginBottom="12px">
                        {t.select_a_token_to_buy_and_hold_and_earn_rewards()}
                    </Typography>
                    <Typography marginBottom="24px">{t.join_the_farm()}</Typography>
                    <Grid container rowSpacing="24px">
                        <Grid item xs={6}>
                            <TokenSelectField
                                label={t.token_to_buy_and_hold()}
                                token={token}
                                disabled={currentChainId !== requiredChainId}
                                onClick={onClickTokenSelect}
                            />
                        </Grid>
                        {!token || loading || !tokenRewards?.length ? (
                            <RewardDataWidget />
                        ) : (
                            tokenRewards.map((reward) => (
                                <RewardDataWidget
                                    key={reward.rewardToken?.address}
                                    title={t.sponsored_referral_farm()}
                                    icon={<SponsoredFarmIcon />}
                                    rewardData={reward}
                                    tokenSymbol={reward.rewardToken?.symbol}
                                />
                            ))
                        )}
                        <Grid item xs={12} display="flex-col" alignItems="center" className={classes.typeNote}>
                            <Divider />
                            <Box marginTop="20px" display="flex" alignItems="center">
                                <SponsoredFarmIcon />
                                <Typography fontWeight={600} margin="0 4px 0 8px">
                                    {t.sponsored_farm()}
                                </Typography>
                                {t.sponsored_farm_detail()}
                            </Box>
                        </Grid>
                    </Grid>
                    <EthereumChainBoundary
                        chainId={requiredChainId}
                        noSwitchNetworkTip
                        classes={{ switchButton: sharedClasses.switchButton }}>
                        <ActionButton
                            fullWidth
                            variant="contained"
                            size="medium"
                            disabled={!token}
                            onClick={onClickBuyToFarm}>
                            {t.buy_to_farm()}
                        </ActionButton>
                    </EthereumChainBoundary>
                </TabPanel>
                <TabPanel value={TabsReferAndBuy.MY_REWARDS} className={classes.tab}>
                    <MyRewards pageType={PagesType.BUY_TO_FARM} {...props} />
                </TabPanel>
            </TabContext>
        </Box>
    )
}
