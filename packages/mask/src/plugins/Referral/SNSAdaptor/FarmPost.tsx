import { useCallback } from 'react'
import { useAsync } from 'react-use'
import { CrossIsolationMessages, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useWeb3, useChainContext } from '@masknet/web3-hooks-base'
import type { Web3 } from '@masknet/web3-shared-evm'
import { TokenIcon, ChainBoundary } from '@masknet/shared'
import { Button, Card, Grid, Typography, Box } from '@mui/material'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'

import type { ReferralMetaData } from '../types.js'
import { MASK_REFERRER, META_KEY, SWAP_CHAIN_ID } from '../constants.js'
import { useI18N } from '../locales/index.js'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI.js'
import { ReferralRPC } from '../messages.js'
import {
    singAndPostProofOfRecommendationOrigin,
    singAndPostProofOfRecommendationWithReferrer,
} from './utils/proofOfRecommendation.js'

import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'
import { RewardFarmPostWidget } from './shared-ui/RewardFarmPostWidget.js'
import { SponsoredFarmIcon } from './shared-ui/icons/SponsoredFarm.js'
import { IconURLs } from '../assets/index.js'

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
}))

export function FarmPost(props: FarmPostProps) {
    usePluginWrapper(true)

    const { payload } = props
    const farmChainId = payload.referral_token_chain_id

    const t = useI18N()
    const { classes } = useStyles()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const currentIdentity = useCurrentIdentity()
    const { value: linkedPersona } = useCurrentLinkedPersona()
    const { showSnackbar } = useCustomSnackbar()

    const { value: rewards = EMPTY_LIST, error } = useAsync(
        async () =>
            farmChainId ? ReferralRPC.getRewardsForReferredToken(farmChainId, payload.referral_token) : EMPTY_LIST,
        [farmChainId],
    )

    const openComposeBox = useCallback(
        (selectedReferralData: Map<string, ReferralMetaData>, id?: string) =>
            CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
                reason: 'timeline',
                open: true,
                content: makeTypedMessageText('', selectedReferralData),
            }),
        [],
    )

    const onError = useCallback((error?: string) => {
        showSnackbar(error || t.go_wrong(), { variant: 'error' })
    }, [])

    const onClickReferToFarm = useCallback(async () => {
        if (!web3) return

        try {
            await singAndPostProofOfRecommendationOrigin(web3, account, payload.referral_token)

            const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? ''

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

            openComposeBox(metadata)
        } catch (error: any) {
            onError(error?.message)
        }
    }, [currentIdentity, payload, farmChainId, account, web3])

    const swapToken = useCallback(() => {
        if (!payload.referral_token) {
            onError(t.error_token_not_select())
            return
        }

        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
            traderProps: {
                defaultInputCoin: {
                    name: payload.referral_token_name,
                    symbol: payload.referral_token_symbol,
                    address: payload.referral_token,
                },
                chainId: SWAP_CHAIN_ID,
            },
        })
    }, [payload])

    const onClickBuyToFarm = useCallback(async () => {
        try {
            const tokenAddress = payload.referral_token
            const referrer = payload?.promoter_address ?? MASK_REFERRER
            await singAndPostProofOfRecommendationWithReferrer(web3 as Web3, account, tokenAddress, referrer)
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
                        logoURL={payload.referral_token_icon}
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
                <ChainBoundary
                    expectedChainId={SWAP_CHAIN_ID}
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                    <WalletConnectedBoundary offChain ActionButtonProps={{ variant: 'roundedDark' }}>
                        <Grid item xs={6} display="flex" textAlign="center">
                            <Button size="medium" onClick={onClickBuyToFarm} variant="roundedDark">
                                {t.buy_to_farm()}
                            </Button>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="end" textAlign="center">
                            <Button size="medium" onClick={onClickReferToFarm} variant="roundedDark">
                                {t.refer_to_farm()}
                            </Button>
                        </Grid>
                    </WalletConnectedBoundary>
                </ChainBoundary>
            </Grid>
        </div>
    )
}
