import { CrossIsolationMessages, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, Divider, Grid, Tab, Tabs, Typography } from '@mui/material'
import { MouseEventHandler, useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { v4 as uuid } from 'uuid'
import { useI18N } from '../locales/index.js'
import { PluginReferralMessages, ReferralRPC, SelectTokenUpdated } from '../messages.js'
import { MASK_REFERRER, SWAP_CHAIN_ID } from '../constants.js'
import { getRequiredChainId } from '../helpers/index.js'
import { FungibleTokenDetailed, PageInterface, PagesType, TabsReferAndBuy, TransactionStatus } from '../types.js'
import { singAndPostProofOfRecommendationWithReferrer } from './utils/proofOfRecommendation.js'
import { ChainBoundary, WalletConnectedBoundary } from '@masknet/plugin-wallet'
import { MyRewards } from './MyRewards/index.js'
import { RewardDataWidget } from './shared-ui/RewardDataWidget.js'
import { TokenSelectField } from './shared-ui/TokenSelectField.js'
import { SponsoredFarmIcon } from './shared-ui/icons/SponsoredFarm.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontSize: 14,
    },
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
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const requiredChainId = getRequiredChainId(currentChainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { showSnackbar } = useCustomSnackbar()

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

    const { value: tokenRewards = EMPTY_LIST, loading } = useAsync(
        async () =>
            token?.address ? ReferralRPC.getRewardsForReferredToken(currentChainId, token.address) : EMPTY_LIST,
        [token?.address, currentChainId],
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

        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
            traderProps: {
                chainId: SWAP_CHAIN_ID,
                defaultInputCoin: token,
            },
        })
    }, [token])

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
        if (!web3) return
        if (!token?.address) return onError(t.error_token_not_select())

        try {
            onConfirmReferFarm()
            await singAndPostProofOfRecommendationWithReferrer(web3, account, token.address, MASK_REFERRER)
            props?.onChangePage?.(PagesType.BUY_TO_FARM, PagesType.BUY_TO_FARM)
            swapToken()
        } catch (error: unknown) {
            if (error instanceof Error) onError(error?.message)
        }
    }, [props?.onChangePage, web3, account, token])

    const BuyButton = (props: { onClick?: MouseEventHandler<HTMLButtonElement> | undefined }) => {
        return (
            <WalletConnectedBoundary offChain expectedChainId={requiredChainId}>
                <ActionButton fullWidth size="medium" disabled={!token} onClick={props.onClick}>
                    {t.buy_to_farm()}
                </ActionButton>
            </WalletConnectedBoundary>
        )
    }

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <Tabs
                    value={tab}
                    centered
                    variant="fullWidth"
                    onChange={(e, v) => setTab(v)}
                    aria-label="persona-post-contacts-button-group">
                    <Tab value={TabsReferAndBuy.NEW} label={t.tab_new()} classes={{ root: classes.root }} />
                    <Tab
                        value={TabsReferAndBuy.MY_REWARDS}
                        label={t.tab_my_rewards()}
                        classes={{ root: classes.root }}
                    />
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
                    <ChainBoundary expectedChainId={requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
                        <BuyButton onClick={onClickBuyToFarm} />
                    </ChainBoundary>
                </TabPanel>
                <TabPanel value={TabsReferAndBuy.MY_REWARDS} className={classes.tab}>
                    <MyRewards pageType={PagesType.BUY_TO_FARM} {...props} />
                </TabPanel>
            </TabContext>
        </Box>
    )
}
