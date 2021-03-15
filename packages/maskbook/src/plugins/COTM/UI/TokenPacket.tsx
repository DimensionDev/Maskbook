import { useCallback, useEffect } from 'react'
import { Box, Card, CardContent, CardHeader, createStyles, Link, makeStyles, Typography } from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import classNames from 'classnames'
import LisaImage from '../assets/Lisa'
import { TokenCard } from './TokenCard'
import type { COTM_JSONPayload } from '../types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { COTM_CONSTANTS } from '../constants'
import { useAccount } from '../../../web3/hooks/useAccount'
import { resolveChainId, resolveChainName, resolveTokenLinkOnEtherscan } from '../../../web3/pipes'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { WalletMessages } from '../../Wallet/messages'
import { useTokens } from '../hooks/useTokens'
import { useTokensOfOwner } from '../hooks/useTokensOfOwner'
import { useAvailability } from '../hooks/useAvailability'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { first } from 'lodash-es'
import { useMintFromServerCallback } from '../hooks/useMintFromServerCallback'
import { EthereumMessages } from '../../Ethereum/messages'
import { activatedSocialNetworkUI } from '../../../social-network-next'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            userSelect: 'none',
            backgroundImage: `url(${LisaImage})`,
            position: 'relative',
        },
        header: {
            zIndex: 0,
            position: 'relative',
            padding: 0,
        },
        content: {
            zIndex: 1,
            position: 'relative',
            paddingBottom: `${theme.spacing(2)} !important`,
        },
        footer: {
            paddingTop: theme.spacing(2),
            display: 'flex',
            justifyContent: 'center',
        },
        cards: {
            scrollSnapAlign: 'center',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'row',
            marginTop: theme.spacing(3),
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        notes: {
            fontSize: 12,
            fontWeight: 500,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        title: {
            fontSize: '24px !important',
            textAlign: 'center',
        },
        card: {
            padding: theme.spacing(2, 1),
            '&:first-child': {
                paddingLeft: 0,
            },
            '&:last-child': {
                paddingRight: 0,
            },
        },
        note: {
            color: theme.palette.common.white,
            fontSize: 'inherit',
            textShadow: [
                '-1px 0 0 #c2130f',
                '1px 0 0 #c2130f',
                '0 -1px 0 #c2130f',
                '0 1px 0 #c2130f',
                '-1px -1px 0 #c2130f',
                '1px -1px 0 #c2130f',
                '-1px 1px 0 #c2130f',
                '1px 1px 0 #c2130f',
            ].join(','),
        },
        link: {
            color: theme.palette.common.white,
            display: 'flex',
            alignItems: 'center',
        },
    }),
)

export interface TokenPacketProps {
    payload: COTM_JSONPayload
}

export function TokenPacket(props: TokenPacketProps) {
    const { payload } = props

    const { t } = useI18N()
    const classes = useStyles()

    // fetch the NTF token
    const COTM_TOKEN_ADDRESS = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')
    const { value: COTM_Token } = useERC721TokenDetailed(COTM_TOKEN_ADDRESS)

    const { value: remaining, loading: loadingRemaining, retry: revalidateAvailability } = useAvailability()
    const tokens = useTokens(COTM_Token)
    const { value: tokensOfOwner, loading: loadingTokensOfOwner, retry: revalidateTokensOfOwner } = useTokensOfOwner(
        COTM_Token,
    )
    const prefaceToken = first(tokensOfOwner.length ? tokensOfOwner : tokens)

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    //#region mint
    const [mintState, mintCallback, resetMintCallback] = useMintFromServerCallback(account)
    //#endregion

    //#region remote controlled transaction dialog
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            [
                `I just received a special NFT from @${payload.sender.name}. Follow @realmaskbook (mask.io) to get your first NFT on Twitter.`,
                '#mask_io #twitternft',
                postLink,
            ].join('\n'),
        )
        .toString()

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetMintCallback()

            if (mintState.type !== TransactionStateType.CONFIRMED) return

            // revalidate my tokens
            revalidateAvailability()
            revalidateTokensOfOwner()
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (mintState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: mintState,
            summary: `Getting #CreativityOnTheMove NFT token.`,
        })
    }, [mintState /* update tx dialog only if state changed */])
    //#endregion

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    // TODO:
    // loading UI
    if (!COTM_Token || !tokens.length) return null
    if (loadingRemaining || loadingTokensOfOwner) return <Typography>Loading the packet…</Typography>
    if (resolveChainId(payload.network) !== chainId)
        return <Typography>Not available on {resolveChainName(chainId)}.</Typography>
    return (
        <>
            <Card className={classes.root} elevation={0}>
                <CardHeader className={classes.header}></CardHeader>
                <CardContent className={classes.content}>
                    <Typography
                        className={classNames(classes.title, classes.note)}
                        gutterBottom
                        variant="h5"
                        component="h2">
                        #CreativityOnTheMove
                    </Typography>
                    <div className={classes.notes}>
                        {tokensOfOwner.length ? (
                            <Typography className={classes.note}>
                                You've collected {tokensOfOwner.length} {COTM_Token.symbol}.
                            </Typography>
                        ) : null}
                        {tokensOfOwner.length === 0 && tokens.length > 0 ? (
                            <Typography className={classes.note}>
                                {remaining > 0 ? `Has been collected ${remaining}/${tokens.length}` : 'None Left'}
                            </Typography>
                        ) : null}
                        <Typography className={classes.note}>
                            <Link
                                className={classes.link}
                                color="textPrimary"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={resolveTokenLinkOnEtherscan(COTM_Token)}>
                                <span>
                                    {COTM_Token.name}({COTM_Token.symbol})
                                </span>
                                <OpenInNewIcon fontSize="inherit" />
                            </Link>
                        </Typography>
                    </div>
                    <div
                        className={classes.cards}
                        style={{
                            justifyContent: 'center',
                        }}>
                        {prefaceToken ? (
                            <section className={classes.card}>
                                <TokenCard token={prefaceToken} />
                            </section>
                        ) : null}
                    </div>
                    <div className={classes.notes}>
                        <Typography className={classes.note}>From @{payload.sender.name || 'Unknown'}</Typography>
                    </div>
                </CardContent>
            </Card>
            <Box className={classes.footer}>
                {!account ? (
                    <ActionButton variant="contained" size="large" onClick={onConnect}>
                        {t('plugin_wallet_connect_a_wallet')}
                    </ActionButton>
                ) : remaining > 0 && tokensOfOwner.length === 0 ? (
                    <ActionButton onClick={mintCallback} variant="contained">
                        {`Get #CreativityOnTheMove NFT`}
                    </ActionButton>
                ) : null}
            </Box>
        </>
    )
}
