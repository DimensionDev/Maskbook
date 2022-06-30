import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import type { Web3 } from '@masknet/web3-shared-evm'
import { useAccount, useChainId, useWeb3 } from '@masknet/plugin-infra/web3'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { v4 as uuid } from 'uuid'
import { blue } from '@mui/material/colors'
import { Typography, Box, Tab, Tabs, Grid, Divider } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'
import { NetworkPluginID } from '@masknet/web3-shared-base'

import { useI18N } from '../locales'
import { META_KEY } from '../constants'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { PluginReferralMessages, SelectTokenUpdated, ReferralRPC } from '../messages'
import { getRequiredChainId } from '../helpers'
import { singAndPostProofOfRecommendationOrigin } from './utils/proofOfRecommendation'
import {
    ReferralMetaData,
    TabsReferAndBuy,
    TransactionStatus,
    PageInterface,
    PagesType,
    FungibleTokenDetailed,
} from '../types'

import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { MyRewards } from './MyRewards'
import { TokenSelectField } from './shared-ui/TokenSelectField'
import { RewardDataWidget } from './shared-ui/RewardDataWidget'
import { SponsoredFarmIcon } from './shared-ui/icons/SponsoredFarm'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

import { useTabStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },

    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'auto',
        padding: `${theme.spacing(3)} 0`,
    },
    tabs: {
        width: '288px',
    },
    chip: {
        width: '150px',
        height: '40px',
        flexDirection: 'row',
    },
    linkText: {
        color: blue[50],
    },
    heading: {
        fontSize: '20px',
        fontWeight: 'bold',
    },
    icon: {
        maxWidth: '20px',
        maxHeight: '20px',
    },
}))

export function ReferToFarm(props: PageInterface) {
    const t = useI18N()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const requiredChainId = getRequiredChainId(currentChainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { showSnackbar } = useCustomSnackbar()
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )
    const currentIdentity = useCurrentIdentity()
    const { value: linkedPersona } = useCurrentLinkedPersona()

    const { classes } = useStyles()
    const { classes: tabClasses } = useTabStyles()

    const [tab, setTab] = useState(TabsReferAndBuy.NEW)
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const [id] = useState(uuid())
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

    const openComposeBox = useCallback(
        (selectedReferralData: Map<string, ReferralMetaData>, id?: string) =>
            CrossIsolationMessages.events.requestComposition.sendToLocal({
                reason: 'timeline',
                open: true,
                content: makeTypedMessageText('', selectedReferralData),
            }),
        [],
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
            title: t.select_a_token_to_refer(),
            onlyFarmTokens: true,
        })
    }, [id, setToken])

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
            props?.onChangePage?.(PagesType.REFER_TO_FARM, PagesType.REFER_TO_FARM)
        },
        [props?.onChangePage, t, showSnackbar],
    )

    const onClickReferFarm = useCallback(async () => {
        if (!token?.address) {
            return onError(t.error_token_not_select())
        }

        try {
            onConfirmReferFarm()

            await singAndPostProofOfRecommendationOrigin(web3 as Web3, account, token.address)

            const metadata = new Map<string, ReferralMetaData>()
            metadata.set(META_KEY, {
                referral_token: token?.address ?? '',
                referral_token_name: token?.name ?? '',
                referral_token_symbol: token?.symbol ?? '',
                referral_token_icon: token?.logoURL ?? '',
                referral_token_chain_id: currentChainId,
                promoter_address: account,
                sender: currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? '',
            })
            closeApplicationBoardDialog()
            props.onClose?.()

            openComposeBox(metadata)
        } catch (error: any) {
            onError(error?.message)
        }
    }, [token, currentChainId, account, currentIdentity, linkedPersona, props.onClose])

    const farm_category_types = [
        {
            title: t.sponsored_referral_farm(),
            desc: t.sponsored_referral_farm_desc(),
            icon: <SponsoredFarmIcon />,
        },
    ]

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
                        {t.select_token_refer()}
                    </Typography>
                    <Typography marginBottom="24px">{t.select_token_refer_desc()}</Typography>
                    <Grid container rowSpacing="24px">
                        <Grid item xs={6}>
                            <TokenSelectField
                                label={t.token_to_refer()}
                                token={token}
                                disabled={currentChainId !== requiredChainId}
                                onClick={onClickTokenSelect}
                            />
                        </Grid>
                        {!token || loading || !tokenRewards.length ? (
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
                    </Grid>
                    <Grid container marginBottom="24px">
                        <Grid item xs={12} margin="24px 0 20px 0">
                            <Divider />
                        </Grid>
                        {farm_category_types.map((category) => (
                            <Grid item xs={12} key={category.title} display="flex" alignItems="center">
                                {category.icon}
                                <Typography fontWeight={600} margin="0 4px 0 8px">
                                    {category.title}
                                </Typography>
                                -<Typography marginLeft="4px">{category.desc}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                    <ChainBoundary expectedChainId={requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
                        <WalletConnectedBoundary offChain>
                            <ActionButton fullWidth size="medium" disabled={!token} onClick={onClickReferFarm}>
                                {t.refer_to_farm()}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </TabPanel>
                <TabPanel value={TabsReferAndBuy.MY_REWARDS} className={classes.tab}>
                    <MyRewards pageType={PagesType.REFER_TO_FARM} {...props} />
                </TabPanel>
            </TabContext>
        </Box>
    )
}
