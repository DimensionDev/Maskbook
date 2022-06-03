import { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { ChainId, Web3 } from '@masknet/web3-shared-evm'
import { NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import { useAccount, useChainId, useWeb3, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { Typography, Box, Tab, Tabs, Grid, TextField, Chip, InputAdornment, Divider } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'

import { useI18N } from '../locales'
import {
    TabsCreateFarm,
    TokenType,
    TransactionStatus,
    PageInterface,
    PagesType,
    ReferralMetaData,
    FungibleTokenDetailed,
} from '../types'
import { ATTRACE_FEE_PERCENT, NATIVE_TOKEN, META_KEY } from '../constants'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { PluginReferralMessages, SelectTokenUpdated } from '../messages'
import { roundValue, getRequiredChainId } from '../helpers'
import { runCreateERC20PairFarm } from './utils/referralFarm'

import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { CreatedFarms } from './CreatedFarms'
import { TokenSelectField } from './shared-ui/TokenSelectField'

import { useSharedStyles, useTabStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
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
    balance: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '80%',
        fontSize: 12,
    },
    textField: {
        width: '50%',
        '&:first-of-type': {
            marginRight: 16,
        },
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

export function CreateFarm(props: PageInterface) {
    const t = useI18N()
    const { classes } = useStyles()
    const { classes: tabClasses } = useTabStyles()
    const { classes: sharedClasses } = useSharedStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const requiredChainId = getRequiredChainId(currentChainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const currentIdentity = useCurrentIdentity()
    const { value: linkedPersona } = useCurrentLinkedPersona()
    const { showSnackbar } = useCustomSnackbar()
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    const [tab, setTab] = useState(TabsCreateFarm.NEW)
    const [tokenRefer, setTokenRefer] = useState<FungibleTokenDetailed>()
    const [tokenReward, setTokenReward] = useState<FungibleTokenDetailed>()
    const [focusedTokenType, setFocusedTokenType] = useState(TokenType.REFER)
    const { value: rewardBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        tokenReward?.address ?? '',
    )
    const [dailyFarmReward, setDailyFarmReward] = useState('')
    const [totalFarmReward, setTotalFarmReward] = useState('')
    const [attraceFee, setAttraceFee] = useState(0)
    const [id] = useState(uuid())

    const onUpdateByRemote = useCallback(
        (ev: SelectTokenUpdated) => {
            if (ev.open || !ev.token || ev.uuid !== id) return

            if (focusedTokenType === TokenType.REFER) {
                setTokenRefer(ev.token)
            }

            if (focusedTokenType === TokenType.REWARD) {
                setTokenReward(ev.token)
            }
        },
        [id, focusedTokenType],
    )
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        PluginReferralMessages.selectTokenUpdated,
        onUpdateByRemote,
    )
    const onTokenSelectClick = useCallback(
        (type: TokenType, title: string) => {
            setFocusedTokenType(type)
            setSelectTokenDialog({
                open: true,
                uuid: id,
                title,
            })
        },
        [id],
    )

    const onChangeTotalFarmReward = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const totalFarmReward = e.currentTarget.value
        const totalFarmRewardNum = Number.parseFloat(e.currentTarget.value)
        const attraceFee = totalFarmRewardNum * (ATTRACE_FEE_PERCENT / 100)

        setTotalFarmReward(totalFarmReward)
        setAttraceFee(attraceFee)
    }, [])

    const onConfirmDeposit = useCallback(() => {
        props?.onChangePage?.(PagesType.TRANSACTION, t.transaction(), {
            hideAttrLogo: true,
            hideBackBtn: true,
            transactionDialog: {
                transaction: {
                    status: TransactionStatus.CONFIRMATION,
                    title: t.transaction_confirm_permission_deposit(),
                    subtitle: t.create_farm_transaction_confirm_desc({
                        reward: roundValue(
                            Number.parseFloat(totalFarmReward) + attraceFee,
                            tokenReward?.decimals,
                        ).toString(),
                        token: tokenReward?.symbol ?? '',
                    }),
                },
            },
        })
    }, [props?.onChangePage, totalFarmReward, attraceFee, tokenReward])

    const openComposeBox = useCallback(
        (message: string, selectedReferralData: Map<string, ReferralMetaData>) =>
            CrossIsolationMessages.events.requestComposition.sendToLocal({
                reason: 'timeline',
                open: true,
                content: makeTypedMessageText(message, selectedReferralData),
            }),
        [],
    )

    const onPublishFarm = useCallback(() => {
        if (!tokenRefer?.address) {
            showSnackbar(t.error_token_not_select(), { variant: 'error' })
            return
        }

        const { address, name = '', symbol = '', logoURL = '' } = tokenRefer

        const metadata = new Map<string, ReferralMetaData>()
        metadata.set(META_KEY, {
            referral_token: address,
            referral_token_name: name,
            referral_token_symbol: symbol,
            referral_token_icon: logoURL,
            referral_token_chain_id: currentChainId,
            sender: currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? '',
        })
        closeApplicationBoardDialog()
        props.onClose?.()

        openComposeBox(t.buy_or_refer_to_earn_buy_hold_referral({ token: symbol }), metadata)
    }, [tokenRefer, showSnackbar, currentChainId, props.onClose, currentIdentity, linkedPersona])

    const onConfirmedDeposit = useCallback(
        (txHash: string) => {
            props?.onChangePage?.(PagesType.TRANSACTION, t.transaction(), {
                hideAttrLogo: true,
                hideBackBtn: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMED,
                        actionButton: {
                            label: t.publish_farm(),
                            onClick: onPublishFarm,
                        },
                        transactionHash: txHash,
                    },
                },
            })
        },
        [props?.onChangePage, onPublishFarm],
    )

    const onErrorDeposit = useCallback(
        (error?: string) => {
            if (error) {
                showSnackbar(error, { variant: 'error' })
            }
            props?.onChangePage?.(PagesType.CREATE_FARM, PagesType.CREATE_FARM)
        },
        [props?.onChangePage],
    )

    const onDeposit = useCallback(async () => {
        if (!tokenRefer?.address || !tokenReward?.address) {
            showSnackbar(t.error_token_not_select(), { variant: 'error' })
            return
        }

        if (tokenRefer.address !== NATIVE_TOKEN) {
            const totalFarmRewardNum = Number.parseFloat(totalFarmReward) + attraceFee

            await runCreateERC20PairFarm(
                onConfirmDeposit,
                onErrorDeposit,
                onConfirmedDeposit,
                web3 as Web3,
                account,
                currentChainId as ChainId,
                tokenReward,
                tokenRefer,
                totalFarmRewardNum,
                Number.parseFloat(dailyFarmReward),
            )
        } else {
            showSnackbar(t.error_native_token_farm(), { variant: 'error' })
        }
    }, [web3, account, currentChainId, tokenRefer, tokenReward, totalFarmReward, dailyFarmReward, attraceFee])

    const onClickCreateFarm = useCallback(() => {
        props.continue(PagesType.CREATE_FARM, PagesType.DEPOSIT, PagesType.CREATE_FARM, {
            hideAttrLogo: true,
            depositDialog: {
                deposit: {
                    totalFarmReward,
                    token: tokenReward,
                    attraceFee,
                    requiredChainId,
                    onDeposit,
                },
            },
        })
    }, [props.continue, attraceFee, totalFarmReward, tokenReward, requiredChainId, onDeposit])

    const balance = formatBalance(rewardBalance ?? '', tokenReward?.decimals, 6)
    const totalFarmRewardNum = Number.parseFloat(totalFarmReward)
    const dailyFarmRewardNum = Number.parseFloat(dailyFarmReward)
    const insufficientFunds = totalFarmRewardNum > Number.parseFloat(balance)
    const totalFarmRewardLessThanDailyFarmReward = totalFarmRewardNum < dailyFarmRewardNum
    const createFarmBtnDisabled =
        !tokenRefer?.address ||
        !tokenReward?.address ||
        !totalFarmRewardNum ||
        !dailyFarmRewardNum ||
        insufficientFunds ||
        totalFarmRewardLessThanDailyFarmReward

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <Tabs
                    value={tab}
                    centered
                    variant="fullWidth"
                    onChange={(e, v) => setTab(v)}
                    aria-label="persona-post-contacts-button-group">
                    <Tab value={TabsCreateFarm.NEW} label={t.tab_new()} classes={tabClasses} />
                    <Tab value={TabsCreateFarm.CREATED} label={t.tab_created()} classes={tabClasses} />
                </Tabs>
                <TabPanel value={TabsCreateFarm.NEW} className={classes.tab}>
                    <Typography fontWeight={600} variant="h6" marginBottom="12px">
                        {t.create_referral_farm_desc()}
                    </Typography>
                    <Typography marginBottom="24px">{t.select_a_token_desc()}</Typography>
                    <Grid container rowSpacing="24px">
                        <Grid item xs={6}>
                            <TokenSelectField
                                label={t.token_to_refer()}
                                token={tokenRefer}
                                disabled={currentChainId !== requiredChainId}
                                style={{ paddingRight: 8 }}
                                onClick={() => onTokenSelectClick(TokenType.REFER, t.select_a_token_to_refer())}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TokenSelectField
                                label={t.reward_token()}
                                token={tokenReward}
                                disabled={currentChainId !== requiredChainId}
                                onClick={() => onTokenSelectClick(TokenType.REWARD, t.select_a_reward_token())}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12} display="flex" marginBottom="24px">
                            <TextField
                                label={t.daily_farm_reward()}
                                value={dailyFarmReward}
                                placeholder="0"
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
                                    endAdornment: <InputAdornment position="end">{tokenReward?.symbol}</InputAdornment>,
                                }}
                            />
                            <TextField
                                label={t.total_farm_rewards()}
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
                                                    {t.wallet_balance()}: {tokenReward ? balance : '-'}
                                                </Typography>
                                                {tokenReward && (
                                                    <Box display="flex" alignItems="center">
                                                        {tokenReward?.symbol}
                                                        <Chip
                                                            size="small"
                                                            label="MAX"
                                                            clickable
                                                            color="primary"
                                                            variant="outlined"
                                                            className={sharedClasses.maxChip}
                                                            onClick={() => setTotalFarmReward(balance)}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                    <ChainBoundary expectedChainId={requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
                        <WalletConnectedBoundary>
                            <ActionButton
                                fullWidth
                                variant="contained"
                                size="medium"
                                disabled={createFarmBtnDisabled}
                                onClick={onClickCreateFarm}>
                                {insufficientFunds || totalFarmRewardLessThanDailyFarmReward ? (
                                    <>
                                        {insufficientFunds
                                            ? t.error_insufficient_balance({ symbol: tokenReward?.symbol ?? '' })
                                            : t.error_daily_rewards()}
                                    </>
                                ) : (
                                    t.create_referral_farm()
                                )}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </TabPanel>
                <TabPanel value={TabsCreateFarm.CREATED} className={classes.tab}>
                    <CreatedFarms continue={props.continue} />
                </TabPanel>
            </TabContext>
        </Box>
    )
}
