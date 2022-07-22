import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '../../../contexts'
import { useSharedI18N } from '../../../locales'
import { Box, Card, DialogContent, Link, Typography } from '@mui/material'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import differenceInCalendarDays from 'date-fns/differenceInDays'
import differenceInCalendarHours from 'date-fns/differenceInHours'
import { Gitcoin, LinkOut, OpenSeaColoredIcon, PolygonScan } from '@masknet/icons'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'

interface CollectionDetailCardProps {
    img?: string
    open: boolean
    title?: string
    referenceUrl?: string
    description?: string
    contributions?: RSS3BaseAPI.DonationTx[]
    onClose: () => void
    date?: string
    location?: string
    relatedURLs?: string[]
    metadata?: RSS3BaseAPI.Metadata
    traits?: Array<{
        type: string
        value: string
    }>
}
const useStyles = makeStyles()((theme) => ({
    img: {
        flexShrink: 1,
        height: '300px !important',
        width: '300px !important',
        borderRadius: 8,
        objectFit: 'cover',
    },
    loadingFailImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 300,
        height: 300,
    },
    flexItem: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
    },
    dayBox: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.highlight,
    },
    linkBox: {
        display: 'flex',
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: theme.palette.maskColor.highlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 24,
    },
    link: {
        color: theme.palette.maskColor.highlight,
    },
    txItem: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    donationAmount: {
        fontSize: 16,
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
    },
    threeLine: {
        display: '-webkit-box',
        '-webkit-line-clamp': 3,
        height: 60,
        fontSize: 14,
        fontWeight: 400,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '-webkit-box-orient': 'vertical',
    },
    themeColor: {
        color: theme.palette.maskColor.highlight,
    },
    linkLogo: {
        width: 24,
        height: 24,
    },
    icons: {
        margin: '16px 0 16px 0',
        display: 'flex',
        alignItems: 'center',
    },
    traitsBox: {
        marginTop: 16,
        gridRowGap: 16,
        gridColumnGap: 20,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 170px)',
    },
    traitItem: {
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 8,
        padding: 12,
    },
    traitValue: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    secondText: {
        fontSize: 14,
        fontWeight: 400,
        color: theme.palette.maskColor.second,
    },
}))

const ChainID = {
    ethereum: ChainId.Mainnet,
    polygon: ChainId.Matic,
    bnb: ChainId.BSC,
}

export const CollectionDetailCard = memo<CollectionDetailCardProps>(
    ({
        img,
        open,
        onClose,
        title,
        referenceUrl,
        metadata,
        description,
        contributions,
        date,
        location,
        relatedURLs,
        traits,
    }) => {
        const t = useSharedI18N()
        const { classes } = useStyles()

        const icons = relatedURLs?.map((url) => {
            if (url.includes('etherscan.io')) {
                return (
                    <Link href={url} target="_blank" marginRight="12px">
                        <img
                            className={classes.linkLogo}
                            src={new URL('./assets/etherscan.png', import.meta.url).toString()}
                        />
                    </Link>
                )
            }
            if (url.includes('polygonscan.com/tx')) {
                return (
                    <Link href={url} target="_blank">
                        <PolygonScan size={24} />
                    </Link>
                )
            }
            if (url.includes('polygonscan.com/token')) {
                return (
                    <Link href={url} target="_blank" marginRight="12px">
                        <PolygonScan size={24} />
                    </Link>
                )
            }
            if (url.includes('opensea.io')) {
                return (
                    <Link href={url} target="_blank" marginRight="12px">
                        <OpenSeaColoredIcon size={24} />
                    </Link>
                )
            }
            if (url.includes('gitcoin.co')) {
                return (
                    <Link href={url} target="_blank" marginBottom="8px">
                        <Gitcoin size={28} />
                    </Link>
                )
            }
            return null
        })

        return (
            <InjectedDialog open={open} onClose={onClose} title={t.details()}>
                <DialogContent>
                    <Box className={classes.flexItem}>
                        <Card className={classes.img}>
                            <NFTCardStyledAssetPlayer
                                contractAddress={metadata?.collection_address}
                                chainId={metadata ? ChainID[metadata?.network ?? 'ethereum'] : undefined}
                                url={img}
                                tokenId={metadata?.token_id}
                                classes={{
                                    loadingFailImage: classes.loadingFailImage,
                                    wrapper: classes.img,
                                    iframe: classes.img,
                                }}
                            />
                        </Card>
                    </Box>

                    <Typography fontSize="16px" fontWeight={700} marginTop="38px">
                        {title}
                    </Typography>
                    <div className={classes.icons}> {icons}</div>

                    <Link rel="noopener noreferrer" target="_blank" href={referenceUrl} className={classes.link}>
                        {referenceUrl}
                    </Link>
                    {date && (
                        <Typography fontSize="14px" fontWeight={400} marginTop="12px">
                            {date}
                        </Typography>
                    )}
                    {location && (
                        <Typography fontSize="14px" fontWeight={400} marginTop="8px">
                            <span className={classes.themeColor}>@</span>
                            {location}
                        </Typography>
                    )}
                    <Typography fontSize="16px" fontWeight={700} marginTop="16px">
                        {t.description()}
                    </Typography>
                    <div style={{ display: '-webkit-box' }} className={classes.threeLine}>
                        {description}
                    </div>

                    {contributions ? (
                        <Typography fontSize="16px" fontWeight={700} marginTop="16px">
                            {t.contributions()}
                        </Typography>
                    ) : null}
                    {contributions ? (
                        <Typography fontSize="16px" fontWeight={700} marginBottom="16px">
                            {contributions?.length ?? 0}
                        </Typography>
                    ) : null}
                    {contributions?.map((contribution) => (
                        <div key={contribution.txHash} className={classes.txItem}>
                            <Typography className={classes.donationAmount}>
                                {contribution.formatedAmount} {contribution.symbol}
                            </Typography>
                            <div className={classes.dayBox}>
                                {differenceInCalendarDays(new Date(), new Date(Number(contribution.timeStamp) * 1000))}{' '}
                                {t.days()}{' '}
                                {differenceInCalendarHours(
                                    new Date(),
                                    new Date(Number(contribution.timeStamp) * 1000),
                                ) % 24}{' '}
                                {t.hours()} {t.ago()}
                                <Link
                                    className={classes.linkBox}
                                    target="_blank"
                                    href={explorerResolver.transactionLink(ChainId.Mainnet, contribution.txHash)}>
                                    <LinkOut size={18} color="white" />
                                </Link>
                            </div>
                        </div>
                    ))}
                    {traits && (
                        <Typography fontSize="16px" fontWeight={700}>
                            {t.properties()}
                        </Typography>
                    )}
                    <Box className={classes.traitsBox}>
                        {traits?.map((trait) => (
                            <div key={trait?.type + trait?.value} className={classes.traitItem}>
                                <Typography className={classes.secondText}> {trait?.type}</Typography>
                                <Typography className={classes.traitValue}> {trait?.value}</Typography>
                            </div>
                        ))}
                    </Box>
                </DialogContent>
            </InjectedDialog>
        )
    },
)
