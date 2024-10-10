import { Icons } from '@masknet/icons'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { CopyButton, FormattedBalance, Image, ProgressiveText, ReversedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ShadowRootTooltip, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { useAccount, useWeb3Utils } from '@masknet/web3-hooks-base'
import { type FriendTech as FT } from '@masknet/web3-providers/types'
import { formatBalance } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Link, Skeleton, Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { useOwnKeys } from '../hooks/useOwnKeys.js'
import { Plural, Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    userInfo: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        display: 'grid',
        gap: theme.spacing(1.5),
        padding: theme.spacing(1.5),
        borderRadius: 8,
        gridTemplateColumns: 'repeat(6, 1fr)',
    },
    profile: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        gridColumn: '1/4',
    },
    avatar: {
        borderRadius: '50%',
    },
    account: {
        marginLeft: theme.spacing(1),
        marginRight: 'auto',
        overflow: 'auto',
    },
    name: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    address: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
        gap: 6,
    },
    key: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: 1,
        gridColumn: '4/7',
    },
    keyPrice: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    row: {
        display: 'flex',
        padding: theme.spacing(0, 1.5),
        alignItems: 'center',
    },
    meta: {
        display: 'flex',
        padding: theme.spacing(1.5),
        height: 42,
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 8,
        gridColumn: 'span 2',
    },
    metaLabel: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        textTransform: 'capitalize',
    },
    metaValue: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    link: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    address: string
    user?: FT.User | null
    loading?: boolean
    variant?: 'self' | 'other'
}

export const UserProfile = memo(function UserProfile({ user, address, loading, variant, className, ...rest }: Props) {
    const { classes, theme, cx } = useStyles()
    const identity = useLastRecognizedIdentity()
    const myAccount = useAccount()
    const Utils = useWeb3Utils(NetworkPluginID.PLUGIN_EVM)
    const isOther = variant === 'other'
    const { data: ownCount, isLoading: loadingOwnCount } = useOwnKeys(address, myAccount)
    const uiName = user?.twitterUsername || identity?.identifier?.userId
    return (
        <div className={cx(classes.userInfo, className)} {...rest}>
            <div className={classes.profile}>
                {loading ?
                    <Skeleton variant="circular" height={40} width={40} />
                :   <Image
                        className={classes.avatar}
                        classes={{ failed: classes.avatar }}
                        src={user?.twitterPfpUrl}
                        size={40}
                    />
                }
                <div className={classes.account}>
                    <TextOverflowTooltip as={ShadowRootTooltip} title={uiName}>
                        <ProgressiveText className={classes.name} loading={loading} skeletonWidth={60}>
                            @{uiName}
                        </ProgressiveText>
                    </TextOverflowTooltip>
                    <div className={classes.address}>
                        <ReversedAddress address={address} fontSize={12} />
                        <CopyButton text={address} size={16} />
                        <Link
                            className={classes.link}
                            href={Utils.explorerResolver.addressLink(ChainId.Base, address) ?? ''}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut size={16} />
                        </Link>
                    </div>
                </div>
                {user?.twitterName ?
                    <Link
                        className={classes.link}
                        href={`https://www.friend.tech/${user.twitterUsername}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.FriendTech size={24} />
                    </Link>
                :   null}
            </div>
            <div className={classes.key}>
                <div className={classes.row}>
                    <Typography color={theme.palette.maskColor.second} mr={1} fontSize={14}>
                        <Trans>Key Price</Trans>
                    </Typography>
                    <ShadowRootTooltip
                        title={
                            <Trans>
                                The price of next share is equal to the S^2 / 16000*1 ether where S is the current
                                number of keys.
                            </Trans>
                        }
                        placement="top"
                        PopperProps={{ style: { width: 268 } }}>
                        <Icons.Questions color={theme.palette.maskColor.second} size={18} />
                    </ShadowRootTooltip>
                    <ProgressiveText className={classes.keyPrice} ml="auto" loading={loading} skeletonWidth={50}>
                        <Icons.ETHSymbol size={18} />
                        <FormattedBalance value={user?.displayPrice} decimals={18} formatter={formatBalance} />
                    </ProgressiveText>
                </div>
                {isOther ?
                    <div className={classes.row}>
                        <Typography color={theme.palette.maskColor.second} mr={1} fontSize={14}>
                            <Trans>You Own</Trans>
                        </Typography>
                        <ProgressiveText
                            className={classes.keyPrice}
                            ml="auto"
                            skeletonWidth={50}
                            loading={loadingOwnCount}>
                            {ownCount === undefined ? '--' : <Plural value={ownCount} one="# Key" other="# Keys" />}
                        </ProgressiveText>
                    </div>
                :   null}
            </div>
            {isOther ? null : (
                <>
                    <div className={classes.meta}>
                        <Typography className={classes.metaLabel}>
                            <Trans>Holders</Trans>
                        </Typography>
                        <ProgressiveText className={classes.metaValue} loading={loading} skeletonWidth={50}>
                            {user?.holderCount}
                        </ProgressiveText>
                    </div>
                    <div className={classes.meta}>
                        <Typography className={classes.metaLabel}>
                            <Trans>Your Rank</Trans>
                        </Typography>
                        <ProgressiveText className={classes.metaValue} loading={loading} skeletonWidth={50}>
                            {user?.rank !== undefined ? `#${user.rank}` : '--'}
                        </ProgressiveText>
                    </div>
                    <div className={classes.meta}>
                        <Typography className={classes.metaLabel}>
                            <Trans>Holding</Trans>
                        </Typography>
                        <ProgressiveText className={classes.metaValue} loading={loading} skeletonWidth={50}>
                            <Plural value={user?.holdingCount || 0} one="# Key" other="# Keys" />
                        </ProgressiveText>
                    </div>
                </>
            )}
        </div>
    )
})
