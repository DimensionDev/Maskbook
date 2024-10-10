import { Icons } from '@masknet/icons'
import { CopyButton, Image } from '@masknet/shared'
import { CrossIsolationMessages, NextIDPlatform, type BindingProof, PersistentStorages } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { ActionButton, MaskColors, makeStyles } from '@masknet/theme'
import { useChainContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { ENS, Lens } from '@masknet/web3-providers'
import { isSameAddress, resolveNextIDPlatformLink } from '@masknet/web3-shared-base'
import { MenuItem, Typography } from '@mui/material'
import { memo } from 'react'
import { useAsync } from 'react-use'
import { SocialTooltip } from './SocialTooltip.js'
import { resolveNextIDPlatformIcon } from './utils.js'
import { first } from 'lodash-es'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    listItem: {
        boxSizing: 'border-box',
        padding: theme.spacing(0.5),
        borderRadius: 4,
        color: theme.palette.maskColor.main,
        display: 'block',
        '&:hover': {
            background: theme.palette.maskColor.bg,
        },
        marginBottom: 6,
        '&:last-of-type': {
            marginBottom: 0,
        },
    },
    content: {
        whiteSpace: 'nowrap',
        height: 40,
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        borderRadius: '50%',
    },
    socialName: {
        color: theme.palette.maskColor.main,
        fontWeight: 400,
        marginLeft: 4,
        fontSize: 14,
    },
    accountName: {
        color: theme.palette.maskColor.main,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        paddingRight: theme.spacing(1),
    },
    address: {
        color: MaskColors.light.text.secondary,
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        overflow: 'auto',
    },
    addressText: {
        fontSize: '10px',
        overflow: 'auto',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    copyButton: {
        marginLeft: theme.spacing(0.5),
        color: MaskColors.light.text.secondary,
        padding: 0,
    },
    followButton: {
        marginLeft: 'auto',
        height: 32,
        padding: theme.spacing(1, 1.5),
        backgroundColor: '#ABFE2C',
        color: '#000',
        borderRadius: 99,
        minWidth: 64,
        fontSize: 12,
        '&:hover': {
            backgroundColor: '#ABFE2C',
            color: '#000',
        },
    },
    linkIcon: {
        display: 'flex',
        marginLeft: 'auto',
    },
    linkOutIcon: {
        cursor: 'pointer',
    },
    related: {
        whiteSpace: 'break-spaces',
        lineBreak: 'anywhere',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
    },
    ens: {
        whiteSpace: 'nowrap',
        padding: theme.spacing(0.25, 0.5),
        marginRight: 6,
        fontSize: 12,
        maxWidth: '100%',
        display: 'inline-block',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 4,
    },
}))

const ENSAddress = memo(({ domain }: { domain: string }) => {
    const { classes } = useStyles()
    const { value: address } = useAsync(() => {
        return ENS.lookup(domain)
    }, [domain])

    if (!address) return null

    return (
        <div className={classes.address}>
            <Typography className={classes.addressText}>{address}</Typography>
            <CopyButton text={address} size={14} className={classes.copyButton} />
        </div>
    )
})
ENSAddress.displayName = 'ENSAddress'

interface SocialAccountListItemProps {
    platform: NextIDPlatform
    identity: string
    name: string
    onClose: () => void
    relatedList?: BindingProof[]
    link?: string
    profileUrl?: string
}

export function SocialAccountListItem({
    platform,
    link,
    identity,
    name,
    onClose,
    relatedList,
    profileUrl,
}: SocialAccountListItemProps) {
    const { account } = useChainContext()
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils()

    const { loading, value } = useAsync(async () => {
        if (platform !== NextIDPlatform.LENS || !identity) return
        const profile = await Lens.getProfileByHandle(identity)
        let currentProfileId =
            PersistentStorages.Settings.storage.latestLensProfile.value ||
            (await Lens.queryDefaultProfileByAddress(account))?.id
        if (!currentProfileId) {
            const profiles = await Lens.queryProfilesByAddress(account)
            currentProfileId = first(profiles)?.id
        }

        const isFollowing = await Lens.queryFollowStatus(currentProfileId ?? '', profile.id)
        return {
            ownedBy: profile.ownedBy,
            isFollowing,
        }
    }, [identity, platform, account])

    const PlatformIcon = resolveNextIDPlatformIcon(platform)
    const renderIcon = PlatformIcon ? <PlatformIcon size={20} /> : null

    const icon =
        profileUrl ?
            <Image
                size={20}
                src={profileUrl}
                className={classes.avatar}
                fallback={renderIcon}
                containerProps={{ className: classes.avatar }}
            />
        :   renderIcon

    return (
        <SocialTooltip platform={platform}>
            <MenuItem
                className={classes.listItem}
                disableRipple
                disabled={false}
                onClick={async () => {
                    if (platform === NextIDPlatform.ENS) {
                        const address = await ENS.lookup(identity)
                        if (!address) return
                        openWindow(`https://app.ens.domains/address/${address}`)
                    }
                    return openWindow(link ?? resolveNextIDPlatformLink(platform, identity, name))
                }}>
                <div className={classes.content}>
                    {icon}

                    <Typography className={cx(classes.socialName, classes.accountName)} component="div">
                        {Utils.isValidAddress(name || identity) ?
                            <>
                                {Utils.formatAddress(name || identity, 4)}
                                <CopyButton size={14} text={name || identity} />
                            </>
                        :   name || identity}
                        {platform === NextIDPlatform.ENS ?
                            <ENSAddress domain={identity} />
                        :   null}
                    </Typography>
                    {platform === NextIDPlatform.LENS ?
                        <ActionButton
                            loading={loading}
                            variant="text"
                            className={classes.followButton}
                            disableElevation
                            onClick={(event) => {
                                event.stopPropagation()
                                onClose()
                                CrossIsolationMessages.events.followLensDialogEvent.sendToLocal({
                                    open: true,
                                    handle: identity,
                                })
                            }}>
                            {isSameAddress(account, value?.ownedBy.address) ?
                                <Trans>View</Trans>
                            : value?.isFollowing ?
                                <Trans>Following</Trans>
                            :   <Trans>Follow</Trans>}
                        </ActionButton>
                    :   <div className={classes.linkIcon}>
                            <Icons.LinkOut size={16} className={classes.linkOutIcon} />
                        </div>
                    }
                </div>
                {platform === NextIDPlatform.ENS && relatedList?.length ?
                    <div className={classes.related}>
                        {relatedList.map((y) => (
                            <Typography component="span" key={y.name} className={classes.ens}>
                                {y.name}
                            </Typography>
                        ))}
                    </div>
                :   null}
            </MenuItem>
        </SocialTooltip>
    )
}
