import { Icons } from '@masknet/icons'
import { isNonNull } from '@masknet/kit'
import { CopyButton, useMenuConfig, useSharedI18N } from '@masknet/shared'
import { CrossIsolationMessages, NextIDPlatform, type BindingProof } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { MaskColors, makeStyles } from '@masknet/theme'
import { ENS } from '@masknet/web3-providers'
import { resolveNextIDPlatformLink } from '@masknet/web3-shared-base'
import { Button, MenuItem, Typography, type MenuProps } from '@mui/material'
import { uniqBy } from 'lodash-es'
import { memo, useEffect, useMemo, useRef, type HTMLProps } from 'react'
import { useAsync, useWindowScroll } from 'react-use'
import { SocialTooltip } from './SocialTooltip.js'
import { resolveNextIDPlatformIcon } from './utils.js'

const useStyles = makeStyles()((theme) => {
    return {
        socialName: {
            color: theme.palette.maskColor.main,
            fontWeight: 400,
            marginLeft: 4,
            fontSize: 14,
        },
        iconStack: {
            height: 28,
            padding: theme.spacing(0.5),
            boxSizing: 'border-box',
            borderRadius: 8,
            minWidth: 'auto',
            '&:hover': {
                backgroundColor: 'transparent',
            },
            '&:active': {
                backgroundColor: 'transparent',
            },
        },
        icon: {
            marginLeft: '-3.5px',
            ':nth-of-type(1)': {
                zIndex: 2,
                marginLeft: 0,
            },
            ':nth-of-type(2)': {
                zIndex: 1,
            },
            ':nth-of-type(3)': {
                zIndex: 0,
            },
        },
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
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        copyButton: {
            marginLeft: theme.spacing(0.5),
            color: MaskColors.light.text.secondary,
            padding: 0,
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
        linkIcon: {
            display: 'flex',
            marginLeft: 'auto',
        },
        accountName: {
            color: theme.palette.maskColor.main,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            paddingRight: theme.spacing(1),
        },
        menu: {
            minWidth: 320,
            maxWidth: 340,
            boxSizing: 'border-box',
            maxHeight: 296,
            borderRadius: 16,
            padding: theme.spacing(1.5),
            translate: theme.spacing(1.9, 1),
            background: theme.palette.maskColor.bottom,
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        menuList: {
            padding: 0,
        },
        followButton: {
            marginLeft: 'auto',
            height: 32,
            padding: theme.spacing(1, 2),
            backgroundColor: '#ABFE2C',
            color: '#000',
            borderRadius: 99,
            '&:hover': {
                backgroundColor: '#ABFE2C',
                color: '#000',
            },
        },
        linkOutIcon: {
            cursor: 'pointer',
        },
    }
})

const ENSAddress = memo(({ domain }: { domain: string }) => {
    const { classes } = useStyles()
    const { value: address } = useAsync(() => {
        return ENS.lookup(domain)
    }, [domain])

    if (!address) return null

    return (
        <div className={classes.address}>
            <div className={classes.addressText}>{address}</div>
            <CopyButton text={address} size={14} className={classes.copyButton} />
        </div>
    )
})
ENSAddress.displayName = 'ENSAddress'

interface SocialAccountListProps extends HTMLProps<HTMLDivElement>, Pick<MenuProps, 'disablePortal'> {
    nextIdBindings: BindingProof[]
}

export function SocialAccountList({ nextIdBindings, disablePortal, ...rest }: SocialAccountListProps) {
    const t = useSharedI18N()
    const { classes, cx } = useStyles()
    const ref = useRef<HTMLDivElement | null>(null)
    const orderedBindings = useMemo(() => {
        return nextIdBindings.sort((a, z) => {
            if (a.platform === z.platform) return 0
            return a.platform === NextIDPlatform.LENS ? -1 : 0
        })
    }, [nextIdBindings])

    const [menu, openMenu, closeMenu] = useMenuConfig(
        orderedBindings.map((x, i) => {
            const Icon = resolveNextIDPlatformIcon(x.platform)
            return (
                <SocialTooltip key={i} platform={x.source}>
                    <MenuItem
                        className={classes.listItem}
                        disableRipple
                        disabled={false}
                        onClick={() => {
                            if (x.platform === NextIDPlatform.ENS) {
                                ENS.lookup(x.identity).then((address) => {
                                    openWindow(`https://app.ens.domains/address/${address}`)
                                })
                                return
                            }
                            return openWindow(x.link ?? resolveNextIDPlatformLink(x.platform, x.identity, x.name))
                        }}>
                        <div className={classes.content}>
                            {Icon ? <Icon size={20} /> : null}
                            <Typography className={cx(classes.socialName, classes.accountName)} component="div">
                                {x.name || x.identity}
                                {x.platform === NextIDPlatform.ENS ? <ENSAddress domain={x.identity} /> : null}
                            </Typography>
                            {x.platform === NextIDPlatform.LENS ? (
                                <Button
                                    variant="text"
                                    className={classes.followButton}
                                    disableElevation
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        closeMenu()
                                        CrossIsolationMessages.events.followLensDialogEvent.sendToLocal({
                                            open: true,
                                            handle: x.identity,
                                        })
                                    }}>
                                    {t.lens_follow()}
                                </Button>
                            ) : (
                                <div className={classes.linkIcon}>
                                    <Icons.LinkOut size={16} className={classes.linkOutIcon} />
                                </div>
                            )}
                        </div>
                        {x.platform === NextIDPlatform.ENS && x.relatedList?.length ? (
                            <div className={classes.related}>
                                {x.relatedList.map((y) => (
                                    <Typography component="span" key={y.name} className={classes.ens}>
                                        {y.name}
                                    </Typography>
                                ))}
                            </div>
                        ) : null}
                    </MenuItem>
                </SocialTooltip>
            )
        }),
        {
            hideBackdrop: true,
            anchorSibling: false,
            disablePortal,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            PaperProps: {
                className: classes.menu,
            },
            MenuListProps: {
                className: classes.menuList,
                // Remove space for scrollbar
                style: {
                    paddingRight: 0,
                    width: '100%',
                },
            },
        },
        ref,
    )

    const position = useWindowScroll()
    useEffect(closeMenu, [position])

    const platformIcons = useMemo(() => {
        return uniqBy(orderedBindings, (x) => x.platform)
            .map((x) => resolveNextIDPlatformIcon(x.platform))
            .filter(isNonNull)
            .slice(0, 3)
    }, [orderedBindings])

    if (!platformIcons.length) return null

    return (
        <div {...rest}>
            <Button variant="text" onClick={openMenu} className={classes.iconStack} disableRipple>
                {platformIcons.map((Icon, index) => (
                    <Icon key={index} className={classes.icon} size={20} />
                ))}
            </Button>
            {menu}
        </div>
    )
}
