import { memo, ReactNode } from 'react'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '../../../contexts'
import { useSharedI18N } from '../../../locales'
import { Box, Card, DialogContent, Link, Typography } from '@mui/material'
import { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { Icons } from '@masknet/icons'
import { ChainId, explorerResolver, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

interface CollectionDetailCardProps {
    img?: string
    open: boolean
    title?: string
    referenceURL?: string
    description?: string
    onClose: () => void
    date?: string
    location?: string
    relatedURLs?: string[]
    metadata?: RSS3BaseAPI.Metadata
    traits?: Array<{
        type: string
        value: string
    }>
    type: CollectionType
    time?: string
    tokenAmount?: string
    tokenSymbol?: string
    hash?: string
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
        '-webkit-line-clamp': '3',
        height: 50,
        fontSize: 14,
        fontWeight: 400,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '-webkit-box-orient': 'vertical',
        fontFamily: 'Helvetica',
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
    singleRow: {
        maxWidth: 400,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    linkOutIcon: {
        color: theme.palette.mode === 'light' ? 'white' : 'black',
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
        referenceURL,
        metadata,
        description,
        date,
        location,
        relatedURLs = EMPTY_LIST,
        traits = EMPTY_LIST,
        type,
        time,
        tokenAmount,
        tokenSymbol,
        hash,
    }) => {
        const t = useSharedI18N()
        const { classes } = useStyles()

        const icons = relatedURLs.map((url) => {
            let icon: ReactNode = null
            if (url.includes('etherscan.io')) {
                icon = <Icons.EtherScan size={24} sx={{ marginRight: '12px' }} />
            } else if (url.includes('polygonscan.com/tx')) {
                icon = <Icons.PolygonScan size={24} sx={{ marginRight: '12px' }} />
            } else if (url.includes('polygonscan.com/token')) {
                icon = <Icons.PolygonScan size={24} sx={{ marginRight: '12px' }} />
            } else if (url.includes('opensea.io')) {
                icon = <Icons.OpenSeaColored size={24} sx={{ marginRight: '12px' }} />
            } else if (url.includes('gitcoin.co')) {
                icon = <Icons.Gitcoin size={28} sx={{ marginRight: '12px' }} />
            }
            return icon ? (
                <Link href={url} target="_blank" marginBottom="8px">
                    {icon}
                </Link>
            ) : null
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
                    {icons.length > 0 && <div className={classes.icons}>{icons}</div>}

                    <Typography className={classes.singleRow}>
                        <Link rel="noopener noreferrer" target="_blank" href={referenceURL} className={classes.link}>
                            {referenceURL}
                        </Link>
                    </Typography>
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
                    <div className={classes.threeLine}>{description}</div>

                    {type === CollectionType.Donations ? (
                        <>
                            <Typography fontSize="16px" fontWeight={700} marginTop="16px">
                                {t.contributions()}
                            </Typography>
                            <Typography fontSize="16px" fontWeight={700} marginBottom="16px">
                                {1}
                            </Typography>
                            <div className={classes.txItem}>
                                <Typography className={classes.donationAmount}>
                                    {tokenAmount} {tokenSymbol}
                                </Typography>
                                <div className={classes.dayBox}>
                                    {formatDistanceToNow(new Date(time ?? 0))} {t.ago()}
                                    <Link
                                        className={classes.linkBox}
                                        target="_blank"
                                        href={explorerResolver.transactionLink(ChainId.Mainnet, hash ?? ZERO_ADDRESS)}>
                                        <Icons.LinkOut size={18} className={classes.linkOutIcon} />
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : null}
                    {traits.length > 0 && (
                        <Typography fontSize="16px" fontWeight={700}>
                            {t.properties()}
                        </Typography>
                    )}
                    {traits.length > 0 && (
                        <Box className={classes.traitsBox}>
                            {traits.map((trait) => (
                                <div key={trait.type + trait.value} className={classes.traitItem}>
                                    <Typography className={classes.secondText}>{trait.type}</Typography>
                                    <Typography className={classes.traitValue}>{trait.value}</Typography>
                                </div>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </InjectedDialog>
        )
    },
)
