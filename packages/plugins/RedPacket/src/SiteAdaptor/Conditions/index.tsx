import { Icons } from '@masknet/icons'
import { MaskColors, makeStyles } from '@masknet/theme'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Box, IconButton, Typography, type BoxProps } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { TokenIcon } from '@masknet/shared'
import { formatBalance, isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    box: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        color: MaskColors.dark.text.primary,
        borderRadius: 8,
        padding: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    header: {
        fontSize: 24,
        height: 20,
        fontWeight: 700,
        paddingBottom: theme.spacing(2),
        lineHeight: '120%',
        display: 'flex',
        alignItems: 'center',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            paddingBottom: theme.spacing(1),
            fontSize: 15,
        },
    },
    closeButton: {
        position: 'absolute',
        color: theme.palette.common.white,
        padding: 0,
        right: -15,
        top: -15,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    assets: {
        display: 'flex',
        gap: theme.spacing(1.5),
        flexFlow: 'row wrap',
    },
    collections: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: theme.spacing(1.5),
    },
    asset: {
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        gap: theme.spacing(1),
    },
    assetName: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.common.white,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginRight: '0px !important',
    },
    unsatisfied: {
        position: 'absolute',
        left: 12,
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(255, 53, 69, 0.2)',
        borderRadius: 4,
        padding: 6,
        color: theme.palette.maskColor.white,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

interface Props extends BoxProps {
    unsatisfied?: boolean
    statusList: FireflyRedPacketAPI.ClaimStrategyStatus[]
    onClose?(): void
}

export function Conditions({ onClose, statusList, unsatisfied = true, ...props }: Props) {
    const { classes, cx } = useStyles()
    const tokenPayloads = statusList.find((x) => x.type === FireflyRedPacketAPI.StrategyType.tokens)?.payload
    const tokenPayload = tokenPayloads?.[0]
    const quantity = tokenPayload ? formatBalance(tokenPayload.amount, tokenPayload.decimals) : ''

    const collectionPayloads = statusList.find((x) => x.type === FireflyRedPacketAPI.StrategyType.nftOwned)?.payload

    return (
        <Box {...props} className={cx(classes.box, props.className)}>
            <Typography variant="h2" className={classes.header}>
                <Trans>Who can claim?</Trans>
            </Typography>
            <div className={classes.content}>
                {tokenPayloads?.length ?
                    <div className={classes.section}>
                        <Typography className={classes.sectionTitle}>
                            {isZero(quantity || 0) ?
                                <Trans>You need to hold any of the following tokens.</Trans>
                            :   <Trans>You need to hold at least {quantity} of any of the following tokens.</Trans>}
                        </Typography>

                        <div className={classes.assets}>
                            {tokenPayloads.map((token) => (
                                <div className={classes.asset} key={token.contractAddress}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        address={token.contractAddress}
                                        name={token.name}
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                        chainId={Number.parseInt(token.chainId, 10)}
                                        logoURL={token.icon}
                                        size={24}
                                        badgeSize={12}
                                    />
                                    <Typography className={classes.assetName}>{token.symbol}</Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                :   null}
                {tokenPayloads?.length && collectionPayloads?.length ?
                    <Typography className={classes.sectionTitle} textAlign="center">
                        <Trans>or</Trans>
                    </Typography>
                :   null}
                {collectionPayloads?.length ?
                    <div className={classes.section}>
                        <Typography className={classes.sectionTitle}>
                            <Trans>You need to hold any of the following NFTs in your wallet.</Trans>
                        </Typography>

                        <div className={classes.collections}>
                            {collectionPayloads.map((collection) => (
                                <div className={classes.asset} key={collection.contractAddress}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        name={collection.collectionName}
                                        chainId={Number.parseInt(collection.chainId, 10)}
                                        logoURL={collection.icon!}
                                        size={36}
                                        badgeSize={12}
                                    />
                                    <Typography className={classes.assetName}>{collection.collectionName}</Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                :   null}
                {unsatisfied ?
                    <Typography className={classes.unsatisfied}>
                        <Trans>Your wallet does not meet the eligibility criteria for claiming.</Trans>
                    </Typography>
                :   null}
            </div>
            <IconButton className={classes.closeButton} disableRipple onClick={() => onClose?.()} aria-label="Close">
                <Icons.BaseClose size={30} />
            </IconButton>
        </Box>
    )
}
