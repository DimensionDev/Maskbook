import { useCallback } from 'react'
import { useAsync } from 'react-use'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useAccount, useWeb3, useTokenListConstants } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { TokenIcon } from '@masknet/shared'
import { Button, Card, Grid, Typography, Box } from '@mui/material'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'

import type { ReferralMetaData } from '../types'
import type { Coin } from '../../Trader/types'
import { proofOfRecommendationService, farmsService } from '../Worker/services'
import { MASK_REFERRER, META_KEY, SWAP_CHAIN_ID } from '../constants'
import { useI18N } from '../../../utils'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { getFarmsRewardData, getSponsoredFarmsForReferredToken } from '../helpers'
import { PluginTraderMessages } from '../../Trader/messages'

import { RewardFarmPostWidget } from './shared-ui/RewardFarmPostWidget'
import { SponsoredFarmIcon } from './shared-ui/icons/SponsoredFarm'

interface FarmPostProps {
    payload: ReferralMetaData
}
const useStyles = makeStyles()(() => ({
    content: {
        background: 'linear-gradient(194.37deg, #0081F9 2.19%, #746AFD 61.94%, #A261FF 95.94%)',
        color: '#FFFFFF',
    },
    actions: {
        paddingTop: '16px',
        '& button': {
            width: 'calc( 100% - 8px)',
        },
    },
}))

export function FarmPost(props: FarmPostProps) {
    usePluginWrapper(true)

    const { payload } = props
    const token = payload.referral_token
    const chainId = payload.referral_token_chain_id

    const { classes } = useStyles()
    const web3 = useWeb3({ chainId })
    const account = useAccount()
    const { t } = useI18N()
    const currentIdentity = useCurrentIdentity()
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)
    const { showSnackbar } = useCustomSnackbar()
    const { ERC20 } = useTokenListConstants()

    const { value: farms = [] } = useAsync(
        async () => (chainId ? farmsService.getAllFarms(chainId, ERC20) : []),
        [ERC20, chainId],
    )
    const openComposeBox = useCallback(
        (message: string, selectedReferralData: Map<string, ReferralMetaData>, id?: string) =>
            CrossIsolationMessages.events.requestComposition.sendToLocal({
                reason: 'timeline',
                open: true,
                content: makeTypedMessageText(message, selectedReferralData),
            }),
        [],
    )

    const onError = useCallback(
        (error?: string) => {
            showSnackbar(error || t('go_wrong'), { variant: 'error' })
        },
        [props],
    )

    const onClickReferToFarm = async () => {
        try {
            await proofOfRecommendationService.singAndPostProofOfRecommendationOrigin(
                web3,
                account,
                payload.referral_token,
            )

            const senderName =
                currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'

            const metadata = new Map<string, ReferralMetaData>()
            metadata.set(META_KEY, {
                referral_token: payload.referral_token,
                referral_token_name: payload.referral_token_name,
                referral_token_symbol: payload.referral_token_symbol,
                referral_token_icon: payload.referral_token_icon,
                referral_token_chain_id: chainId,
                promoter_address: account,
                sender: senderName,
            })

            openComposeBox(
                t('plugin_referral_buy_refer_earn_yield', { token: payload.referral_token_symbol }),
                metadata,
            )
        } catch (error: any) {
            onError(error?.message)
        }
    }

    const swapToken = useCallback(() => {
        if (!payload.referral_token) {
            onError(t('plugin_referral_error_token_not_select'))
            return
        }

        openSwapDialog({
            open: true,
            traderProps: {
                chainId: SWAP_CHAIN_ID,
                coin: {
                    id: payload.referral_token,
                    name: payload.referral_token_name,
                    symbol: payload.referral_token_symbol,
                    contract_address: payload.referral_token,
                } as Coin,
            },
        })
    }, [payload, openSwapDialog])

    const onClickBuyToFarm = useCallback(async () => {
        try {
            await proofOfRecommendationService.singAndPostProofOfRecommendationWithReferrer(
                web3,
                account,
                payload.referral_token,
                payload?.promoter_address ?? MASK_REFERRER,
            )
            swapToken()
        } catch (error: any) {
            onError(error?.message)
        }
    }, [web3, account, payload])

    const sponsoredFarms = getSponsoredFarmsForReferredToken(chainId, token, farms)

    return (
        <>
            <Card variant="outlined" sx={{ p: 2 }} className={classes.content}>
                <Box display="flex" alignItems="center">
                    <TokenIcon
                        address={payload.referral_token ?? ''}
                        name={payload.referral_token_name}
                        logoURI={payload.referral_token_icon}
                    />
                    <Typography variant="h6" fontWeight={600} marginLeft="10px">
                        ${payload.referral_token_symbol} {t('plugin_referral_buy_and_hold_referral')}
                    </Typography>
                </Box>
                <Typography marginTop="8px">{t('plugin_referral_join_receive_rewards')}</Typography>
                {sponsoredFarms?.length ? (
                    <RewardFarmPostWidget
                        title={t('plugin_referral_sponsored_referral_farm')}
                        icon={<SponsoredFarmIcon />}
                        rewardData={getFarmsRewardData(sponsoredFarms)}
                        tokenSymbol={payload.referral_token_symbol}
                    />
                ) : null}
                <Typography marginTop="24px" variant="body2">
                    {t('plugin_referral_create_by')} <b>@realMaskNetwork</b>
                </Typography>
            </Card>
            <Grid container className={classes.actions}>
                <Grid item xs={6} display="flex" textAlign="center">
                    <Button variant="contained" size="large" onClick={onClickBuyToFarm}>
                        {t('plugin_referral_buy_to_farm')}
                    </Button>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="end" textAlign="center">
                    <Button variant="contained" size="large" onClick={onClickReferToFarm}>
                        {t('plugin_referral_refer_to_farm')}
                    </Button>
                </Grid>
            </Grid>
        </>
    )
}
