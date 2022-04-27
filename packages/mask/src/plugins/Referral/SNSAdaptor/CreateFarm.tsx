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
import { blue } from '@mui/material/colors'
import { Typography, Box, Tab, Tabs, Grid, TextField, Chip, InputAdornment, Divider } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'

import { useI18N } from '../../../utils'
import { TabsCreateFarm, TokenType, TransactionStatus, PageInterface, PagesType, TabsReferralFarms } from '../types'
import { ATTRACE_FEE_PERCENT, NATIVE_TOKEN, META_KEY } from '../constants'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { referralFarmService } from '../Worker/services'
import { PluginReferralMessages, SelectTokenUpdated } from '../messages'
import { roundValue, getRequiredChainId } from '../helpers'

import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { CreatedFarms } from './CreatedFarms'
import { TokenSelectField } from './shared-ui/TokenSelectField'

import { useSharedStyles, useTabStyles } from './styles'

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
    const { t } = useI18N()
    const { classes } = useStyles()
    const { classes: tabClasses } = useTabStyles()
    const { classes: sharedClasses } = useSharedStyles()
    const currentChainId = useChainId()
    const requiredChainId = getRequiredChainId(currentChainId)
    const web3 = useWeb3()
    const account = useAccount()
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const currentIdentity = useCurrentIdentity()
    const { showSnackbar } = useCustomSnackbar()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const [tab, setTab] = useState(TabsCreateFarm.NEW)
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const { value: rewardBalance = '0' } = useFungibleTokenBalance(
        token?.type ?? EthereumTokenType.Native,
        token?.address ?? '',
    )

    const [dailyFarmReward, setDailyFarmReward] = useState<string>('')
    const [totalFarmReward, setTotalFarmReward] = useState<string>('')
    const [attraceFee, setAttraceFee] = useState<number>(0)
    const [id] = useState(uuid())
    const [focusedTokenPanelType, setFocusedTokenPanelType] = useState(TokenType.REFER)

    const onDeposit = useCallback(async () => {
        if (!token?.address) {
            showSnackbar(t('plugin_referral_error_token_not_select'), { variant: 'error' })
            return
        }

        if (token.address !== NATIVE_TOKEN) {
            const totalFarmRewardNum = Number.parseFloat(totalFarmReward) + attraceFee

            await referralFarmService.runCreateERC20PairFarm(
                (val: boolean) => {
                    val && onConfirmDeposit()
                },
                onErrorDeposit,
                onConfirmedDeposit,
                web3,
                account,
                currentChainId,
                token,
                token,
                totalFarmRewardNum,
                Number.parseFloat(dailyFarmReward),
            )
        } else {
            showSnackbar(t('plugin_referral_error_native_token_farm'), { variant: 'error' })
        }
    }, [web3, account, currentChainId, token, totalFarmReward, dailyFarmReward])

    const onInsertData = useCallback(
        (token?: FungibleTokenDetailed) => {
            if (!token?.address) {
                showSnackbar(t('plugin_referral_error_token_not_select'), { variant: 'error' })
                return
            }

            const { address, name = '', symbol = '', logoURI = [''] } = token
            const selectedReferralData = {
                referral_token: address,
                referral_token_name: name,
                referral_token_symbol: symbol,
                referral_token_icon: logoURI,
                referral_token_chain_id: currentChainId,
                sender: senderName ?? '',
            }
            if (selectedReferralData) {
                attachMetadata(META_KEY, JSON.parse(JSON.stringify(selectedReferralData)))
            } else {
                dropMetadata(META_KEY)
            }

            closeWalletStatusDialog()
            props.onClose?.()
        },
        [token],
    )

    const onUpdateByRemote = useCallback(
        (ev: SelectTokenUpdated) => {
            if (ev.open || !ev.token || ev.uuid !== id) return
            setToken(ev.token)
        },
        [id, setToken],
    )

    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        PluginReferralMessages.selectTokenUpdated,
        onUpdateByRemote,
    )

    const onTokenSelectClick = useCallback(
        (type: TokenType, title: string) => {
            setFocusedTokenPanelType(type)
            setSelectTokenDialog({
                open: true,
                uuid: id,
                title: title,
            })
        },
        [id, focusedTokenPanelType],
    )

    const onChangeTotalFarmReward = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const totalFarmReward = e.currentTarget.value
        const totalFarmRewardNum = Number.parseFloat(e.currentTarget.value)
        const attraceFee = totalFarmRewardNum * (ATTRACE_FEE_PERCENT / 100)

        setTotalFarmReward(totalFarmReward)
        setAttraceFee(attraceFee)
    }, [])

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
                        token,
                        attraceFee,
                        requiredChainId,
                        onDeposit: onDeposit,
                    },
                },
            },
        )
    }, [props, attraceFee, totalFarmReward, token, requiredChainId])

    const onConfirmDeposit = useCallback(() => {
        props?.onChangePage?.(PagesType.TRANSACTION, t('plugin_referral_transaction'), {
            hideAttrLogo: true,
            hideBackBtn: true,
            transactionDialog: {
                transaction: {
                    status: TransactionStatus.CONFIRMATION,
                    title: t('plugin_referral_transaction_confirm_permission_deposit'),
                    subtitle: t('plugin_referral_create_farm_transaction_confirm_desc', {
                        reward: roundValue(Number.parseFloat(totalFarmReward) + attraceFee, token?.decimals),
                        token: token?.symbol ?? '',
                    }),
                },
            },
        })
    }, [props, attraceFee, totalFarmReward, token])

    const onConfirmedDeposit = useCallback(
        (txHash: string) => {
            props?.onChangePage?.(PagesType.TRANSACTION, t('plugin_referral_transaction'), {
                hideAttrLogo: true,
                hideBackBtn: true,
                transactionDialog: {
                    transaction: {
                        status: TransactionStatus.CONFIRMED,
                        actionButton: {
                            label: t('plugin_referral_publish_farm'),
                            onClick: () => onInsertData(token),
                        },
                        transactionHash: txHash,
                    },
                },
            })
        },
        [props, token],
    )
    const onErrorDeposit = useCallback(
        () => props?.onChangePage?.(PagesType.CREATE_FARM, TabsReferralFarms.TOKENS + ': ' + PagesType.CREATE_FARM),
        [props?.onChangePage],
    )

    const balance = formatBalance(rewardBalance ?? '', token?.decimals, 6)
    const totalFarmRewardNum = Number.parseFloat(totalFarmReward)
    const insufficientFunds = totalFarmRewardNum > Number.parseFloat(balance)
    const createFarmBtnDisabled =
        !token?.address || !totalFarmRewardNum || !Number.parseFloat(dailyFarmReward) || insufficientFunds

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <Tabs
                    value={tab}
                    centered
                    variant="fullWidth"
                    onChange={(e, v) => setTab(v)}
                    aria-label="persona-post-contacts-button-group">
                    <Tab value={TabsCreateFarm.NEW} label="New" classes={tabClasses} />
                    <Tab value={TabsCreateFarm.CREATED} label="Created" classes={tabClasses} />
                </Tabs>
                <TabPanel value={TabsCreateFarm.NEW} className={classes.tab}>
                    <Typography fontWeight={600} variant="h6" marginBottom="12px">
                        {t('plugin_referral_create_referral_farm_desc')}
                    </Typography>
                    <Typography marginBottom="24px">{t('plugin_referral_select_a_token_desc')}</Typography>
                    <Grid container rowSpacing="24px">
                        <Grid item xs={6}>
                            <TokenSelectField
                                label={t('plugin_referral_token_to_refer')}
                                token={token}
                                disabled={currentChainId !== requiredChainId}
                                onClick={() => {
                                    onTokenSelectClick(TokenType.REFER, t('plugin_referral_select_a_token_to_refer'))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12} display="flex" marginBottom="24px">
                            <TextField
                                label={t('plugin_referral_daily_farm_reward')}
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
                                    endAdornment: <InputAdornment position="end">{token?.symbol}</InputAdornment>,
                                }}
                            />
                            <TextField
                                label={t('plugin_referral_total_farm_rewards')}
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
                                                    {t('wallet_balance')}: {token ? balance : '-'}
                                                </Typography>
                                                {token && (
                                                    <Box display="flex" alignItems="center">
                                                        {token?.symbol}
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
                            size="large"
                            disabled={createFarmBtnDisabled}
                            onClick={onClickCreateFarm}>
                            {insufficientFunds
                                ? t('plugin_referral_error_insufficient_balance', { symbol: token?.symbol })
                                : t('plugin_referral_create_referral_farm')}
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
