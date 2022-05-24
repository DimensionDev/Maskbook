import { useCallback } from 'react'
import { useAsync } from 'react-use'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useAccount, useWeb3, useChainId, useTokenListConstants } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { TokenIcon } from '@masknet/shared'
import { Button, Card, Grid, Typography, Box } from '@mui/material'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'

import type { ReferralMetaData } from '../types'
import type { Coin } from '../../Trader/types'
import { MASK_REFERRER, META_KEY, SWAP_CHAIN_ID } from '../constants'
import { useI18N } from '../locales'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { PluginTraderMessages } from '../../Trader/messages'
import { ReferralRPC } from '../messages'
import {
    singAndPostProofOfRecommendationOrigin,
    singAndPostProofOfRecommendationWithReferrer,
} from './utils/proofOfRecommendation'

import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { RewardFarmPostWidget } from './shared-ui/RewardFarmPostWidget'
import { SponsoredFarmIcon } from './shared-ui/icons/SponsoredFarm'
import { IconURLs } from '../assets'

import { useSharedStyles } from './styles'

interface FarmPostProps {
    payload: ReferralMetaData
}
const useStyles = makeStyles()(() => ({
    farmPost: {
        padding: '0 15px 15px',
    },
    content: {
        background: 'linear-gradient(194.37deg, #0081F9 2.19%, #746AFD 61.94%, #A261FF 95.94%)',
        color: '#FFFFFF',
        position: 'relative',
        padding: '16px 20px',
    },
    tweetAttraceBg: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    actions: {
        paddingTop: '16px',
        '& button': {
            width: 'calc( 100% - 8px)',
        },
    },
    switchButtonBox: {
        width: '100%',
    },
}))

export function FarmPost(props: FarmPostProps) {
    usePluginWrapper(true)

    const { payload } = props
    const farmChainId = payload.referral_token_chain_id

    const { classes } = useStyles()
    const { classes: sharedClasses } = useSharedStyles()
    const chainId = useChainId()
    const web3 = useWeb3()
    const account = useAccount()
    const t = useI18N()
    const currentIdentity = useCurrentIdentity()
    const { value: linkedPersona } = useCurrentLinkedPersona()
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)
    const { showSnackbar } = useCustomSnackbar()
    const { ERC20 } = useTokenListConstants(farmChainId)

    const { value: rewards = EMPTY_LIST, error } = useAsync(
        async () =>
            farmChainId && ERC20
                ? ReferralRPC.getRewardsForReferredToken(farmChainId, payload.referral_token, ERC20)
                : EMPTY_LIST,
        [farmChainId, ERC20],
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

    const onError = useCallback((error?: string) => {
        showSnackbar(error || t.go_wrong(), { variant: 'error' })
    }, [])

    const onClickReferToFarm = useCallback(async () => {
        try {
            await singAndPostProofOfRecommendationOrigin(web3, account, payload.referral_token)

            const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'

            const metadata = new Map<string, ReferralMetaData>()
            metadata.set(META_KEY, {
                referral_token: payload.referral_token,
                referral_token_name: payload.referral_token_name,
                referral_token_symbol: payload.referral_token_symbol,
                referral_token_icon: payload.referral_token_icon,
                referral_token_chain_id: farmChainId,
                promoter_address: account,
                sender: senderName,
            })

            openComposeBox(t.buy_refer_earn_yield({ token: payload.referral_token_symbol }), metadata)
        } catch (error: any) {
            onError(error?.message)
        }
    }, [currentIdentity, payload, farmChainId, account, web3])

    const swapToken = useCallback(() => {
        if (!payload.referral_token) {
            onError(t.error_token_not_select())
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
            const tokenAddress = payload.referral_token
            const referrer = payload?.promoter_address ?? MASK_REFERRER
            await singAndPostProofOfRecommendationWithReferrer(web3, account, tokenAddress, referrer)
            swapToken()
        } catch (error: any) {
            onError(error?.message)
        }
    }, [payload, account, web3])

    return (
        <div className={classes.farmPost}>
            <Card variant="outlined" className={classes.content}>
                <div className={classes.tweetAttraceBg}>
                    <img src={IconURLs.tweetAttraceBg} />
                </div>
                <Box display="flex" alignItems="center">
                    <TokenIcon
                        address={payload.referral_token ?? ''}
                        name={payload.referral_token_name}
                        logoURI={payload.referral_token_icon}
                    />
                    <Typography variant="h6" fontWeight={600} marginLeft="10px">
                        ${payload.referral_token_symbol} {t.buy_and_hold_referral()}
                    </Typography>
                </Box>
                {error ? (
                    <Box display="flex" marginTop="32px" marginBottom="20px">
                        <img src={IconURLs.sadGhost} />
                        <Box display="flex" flexDirection="column" marginLeft="20px">
                            <Typography fontWeight={600} variant="subtitle1">
                                {t.oops()}
                            </Typography>
                            <Typography marginTop="12px">{t.blockchain_error_referral_farm()}</Typography>
                            <Typography marginTop="4px">{t.try_in_few_minutes()}</Typography>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <Typography marginTop="8px">{t.join_receive_rewards()}</Typography>
                        <Grid container>
                            {rewards?.map((reward) => (
                                <RewardFarmPostWidget
                                    key={reward.rewardToken?.address}
                                    title={t.sponsored_referral_farm()}
                                    icon={<SponsoredFarmIcon />}
                                    rewardData={reward}
                                    tokenSymbol={reward.rewardToken?.symbol}
                                />
                            ))}
                        </Grid>
                    </>
                )}
            </Card>
            <Grid container className={classes.actions}>
                <EthereumChainBoundary
                    chainId={SWAP_CHAIN_ID}
                    noSwitchNetworkTip
                    className={classes.switchButtonBox}
                    classes={{ switchButton: sharedClasses.switchButton }}>
                    <Grid item xs={6} display="flex" textAlign="center">
                        <Button variant="contained" size="medium" onClick={onClickBuyToFarm}>
                            {t.buy_to_farm()}
                        </Button>
                    </Grid>
                    <Grid item xs={6} display="flex" justifyContent="end" textAlign="center">
                        <Button variant="contained" size="medium" onClick={onClickReferToFarm}>
                            {t.refer_to_farm()}
                        </Button>
                    </Grid>
                </EthereumChainBoundary>
            </Grid>
        </div>
    )
}
