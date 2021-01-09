import { useCallback, useEffect } from 'react'
import { Box, Card, CardContent, CardHeader, createStyles, Link, makeStyles, Typography } from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import classNames from 'classnames'
import { ElectionCard } from './ElectionCard'
import type { Election2020JSONPayload } from '../types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ELECTION_2020_CONSTANTS } from '../constants'
import { resolveCandidateName, resolveCandidateBriefName, resolveStateName } from '../pipes'
import { useAccount } from '../../../web3/hooks/useAccount'
import { resolveChainId, resolveChainName, resolveTokenLinkOnEtherscan } from '../../../web3/pipes'
import { useMintCallback } from '../hooks/useMintCallback'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { WalletMessages } from '../../Wallet/messages'
import { useElectionTokens } from '../hooks/useElectionTokens'
import { useElectionTokensOfOwner } from '../hooks/useElectionTokensOfOwner'
import { useShareLink } from '../../../utils/hooks/useShareLink'
import { useAvailability } from '../hooks/useAvailability'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { getUrl } from '../../../utils/utils'
import { useBase64 } from '../../../utils/hooks/useBase64'
import type { CSSProperties } from '@material-ui/core/styles/withStyles'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            userSelect: 'none',
            backgroundImage: 'linear-gradient(180deg, #121d76 0%, #2c39b9 100%)',
            position: 'relative',

            '&::before, &::after': {
                content: '""',
                width: '90%',
                height: 260,
                backgroundImage: 'var(--flag-image)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',

                bottom: '-21%',
                position: 'absolute',
                zIndex: 0,
            },
            '&::before': {
                left: '-12%',
            },
            '&::after': {
                right: '-12%',
                transform: 'scaleX(-1)',
            },
        },
        header: {
            zIndex: 0,
            position: 'relative',
            padding: 0,
            '&::before': {
                content: '""',
                width: '100%',
                height: 260,
                backgroundImage: 'var(--fireworks-image)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                top: 0,
                left: 0,
                position: 'absolute',
                zIndex: 0,
            },
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
                '-1px 0 0 #121d76',
                '1px 0 0 #121d76',
                '0 -1px 0 #121d76',
                '0 1px 0 #121d76',
                '-1px -1px 0 #121d76',
                '1px -1px 0 #121d76',
                '-1px 1px 0 #121d76',
                '1px 1px 0 #121d76',
            ].join(','),
        },
        link: {
            color: theme.palette.common.white,
            display: 'flex',
            alignItems: 'center',
        },
    }),
)

export interface ElectionPacketProps {
    payload: Election2020JSONPayload
}

export function ElectionPacket(props: ElectionPacketProps) {
    const { payload } = props

    const { t } = useI18N()
    const classes = useStyles()

    // fetch the NTF token
    const ELECTION_TOKEN_ADDRESS = useConstant(ELECTION_2020_CONSTANTS, 'ELECTION_TOKEN_ADDRESS')
    const { value: electionToken } = useERC721TokenDetailed(ELECTION_TOKEN_ADDRESS)

    const { value: remaining, loading: loadingRemaining, retry: revalidateAvailability } = useAvailability(
        payload.state,
    )
    const tokens = useElectionTokens(payload.state, electionToken)
    const {
        value: tokensOfOwner,
        loading: loadingTokensOfOwner,
        retry: revalidateTokensOfOwner,
    } = useElectionTokensOfOwner(payload.state, electionToken)

    // fetch images
    const { value: FireworksImage } = useBase64(getUrl('/Election2020/fireworks.jpg'))
    const { value: FlagImage } = useBase64(getUrl('/Election2020/flag.jpg'))

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    //#region mint
    const [mintState, mintCallback, resetMintCallback] = useMintCallback(account, payload.state, payload.winner)
    //#endregion

    //#region remote controlled transaction dialog
    const postLink = usePostLink()
    const shareLink = useShareLink(
        [
            `I just received an election special ${resolveCandidateBriefName(payload.winner)} NFT from @${
                payload.sender.name
            }. Follow @realmaskbook (mask.io) to get your first NFT on Twitter.`,
            '#mask_io #twitternft',
            postLink,
        ].join('\n'),
    )

    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
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
            summary: `Getting ${resolveCandidateName(payload.winner)} wins NFT token.`,
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
    if (!electionToken || !tokens.length) return null
    if (loadingRemaining || loadingTokensOfOwner)
        return <Typography>Loading the election result of {resolveStateName(payload.state)}…</Typography>
    if (resolveChainId(payload.network) !== chainId)
        return <Typography>Not available on {resolveChainName(chainId)}.</Typography>
    return (
        <>
            <Card
                className={classes.root}
                elevation={0}
                style={
                    {
                        '--fireworks-image': `url(${FireworksImage})`,
                        '--flag-image': `url(${FlagImage})`,
                    } as CSSProperties
                }>
                <CardHeader className={classes.header}></CardHeader>
                <CardContent className={classes.content}>
                    <Typography
                        className={classNames(classes.title, classes.note)}
                        gutterBottom
                        variant="h5"
                        component="h2">
                        2020 Presidential Election
                    </Typography>
                    <div className={classes.notes}>
                        {tokensOfOwner.length ? (
                            <Typography className={classes.note}>
                                You've collected {tokensOfOwner.length} {electionToken.symbol}.
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
                                href={resolveTokenLinkOnEtherscan(electionToken)}>
                                <span>
                                    {electionToken.name}({electionToken.symbol})
                                </span>
                                <OpenInNewIcon fontSize="inherit" />
                            </Link>
                        </Typography>
                    </div>
                    <div
                        className={classes.cards}
                        style={{
                            justifyContent:
                                (tokensOfOwner.length ? tokensOfOwner : tokens).length < 3 ? 'center' : 'flex-start',
                        }}>
                        {(tokensOfOwner.length ? tokensOfOwner : tokens).map((x, i) => (
                            <section className={classes.card} key={i}>
                                <ElectionCard token={x} />
                            </section>
                        ))}
                    </div>
                    <div className={classes.notes}>
                        <Typography className={classes.note}>From @{payload.sender.name || 'Unknown'}</Typography>
                    </div>
                </CardContent>
            </Card>
            <Box className={classes.footer}>
                {!account || !chainIdValid ? (
                    <ActionButton variant="contained" size="large" onClick={onConnect}>
                        {t('plugin_wallet_connect_a_wallet')}
                    </ActionButton>
                ) : remaining > 0 && tokensOfOwner.length === 0 ? (
                    <ActionButton onClick={mintCallback} variant="contained">
                        {`Get ${resolveCandidateName(payload.winner)} wins NFT`}
                    </ActionButton>
                ) : null}
            </Box>
        </>
    )
}
