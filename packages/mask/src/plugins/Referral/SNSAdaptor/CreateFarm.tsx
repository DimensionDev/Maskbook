import { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    useAccount,
    useChainId,
    useFungibleTokenBalance,
    useWeb3,
} from '@masknet/web3-shared-evm'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { Typography, Box, Tab, Tabs, Grid, TextField, Chip, InputAdornment, Divider } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'

import { useI18N } from '../locales'
import { TabsCreateFarm, TokenType, TransactionStatus, PageInterface, PagesType, TabsReferralFarms } from '../types'
import { ATTRACE_FEE_PERCENT, NATIVE_TOKEN, META_KEY } from '../constants'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { PluginReferralMessages, SelectTokenUpdated } from '../messages'
import { roundValue, getRequiredChainId } from '../helpers'
import { runCreateERC20PairFarm } from './utils/referralFarm'

import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
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
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const web3 = useWeb3()
    const account = useAccount()
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
        tokenReward?.type ?? EthereumTokenType.Native,
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

    const onInsertData = useCallback(() => {
        if (!tokenRefer?.address) {
            showSnackbar(t.error_token_not_select(), { variant: 'error' })
            return
        }

        const { address, name = '', symbol = '', logoURI = [''] } = tokenRefer
        const selectedReferralData = {
            referral_token: address,
            referral_token_name: name,
            referral_token_symbol: symbol,
            referral_token_icon: logoURI,
            referral_token_chain_id: currentChainId,
            sender: currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User',
        }
        if (selectedReferralData) {
            attachMetadata(META_KEY, JSON.parse(JSON.stringify(selectedReferralData)))
        } else {
            dropMetadata(META_KEY)
        }

        closeApplicationBoardDialog()
        props.onClose?.()
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
                            onClick: onInsertData,
                        },
                        transactionHash: txHash,
                    },
                },
            })
        },
        [props?.onChangePage, onInsertData],
    )

    const onErrorDeposit = useCallback(
        () => props?.onChangePage?.(PagesType.CREATE_FARM, TabsReferralFarms.TOKENS + ': ' + PagesType.CREATE_FARM),
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
                web3,
                account,
                currentChainId,
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
        props.continue(
            PagesType.CREATE_FARM,
            PagesType.DEPOSIT,
            TabsReferralFarms.TOKENS + ': ' + PagesType.CREATE_FARM,
            {
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
            },
        )
    }, [props.continue, attraceFee, totalFarmReward, tokenReward, requiredChainId, onDeposit])

    const balance = formatBalance(rewardBalance ?? '', tokenReward?.decimals, 6)
    const insufficientFunds = Number.parseFloat(totalFarmReward) > Number.parseFloat(balance)
    const createFarmBtnDisabled =
        !tokenRefer?.address ||
        !tokenReward?.address ||
        !Number.parseFloat(totalFarmReward) ||
        !Number.parseFloat(dailyFarmReward) ||
        insufficientFunds

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
                    <EthereumChainBoundary
                        chainId={requiredChainId}
                        noSwitchNetworkTip
                        classes={{ switchButton: sharedClasses.switchButton }}>
                        <ActionButton
                            fullWidth
                            variant="contained"
                            size="medium"
                            disabled={createFarmBtnDisabled}
                            onClick={onClickCreateFarm}>
                            {insufficientFunds
                                ? t.error_insufficient_balance({ symbol: tokenReward?.symbol ?? '' })
                                : t.create_referral_farm()}
                        </ActionButton>
                    </EthereumChainBoundary>
                </TabPanel>
                <TabPanel value={TabsCreateFarm.CREATED} className={classes.tab}>
                    <CreatedFarms continue={props.continue} />
                </TabPanel>
            </TabContext>
        </Box>
    )
}
