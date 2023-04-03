import { Icons } from '@masknet/icons'
import { isNonNull } from '@masknet/kit'
import { type BindingProof, NextIDPlatform, CrossIsolationMessages } from '@masknet/shared-base'
import { CopyButton, useMenuConfig, useSharedI18N } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { MaskColors, makeStyles } from '@masknet/theme'
import { resolveNextIDPlatformLink } from '@masknet/web3-shared-base'
import { Button, MenuItem, Typography, alpha, type MenuProps } from '@mui/material'
import { debounce, uniqBy } from 'lodash-es'
import { type HTMLProps, useEffect, useMemo, useRef, useState, memo } from 'react'
import { useAsync, useWindowScroll } from 'react-use'
import { SocialTooltip } from './SocialTooltip.js'
import { resolveNextIDPlatformIcon } from './utils.js'
import { ENS } from '@masknet/web3-providers'

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
            backgroundColor: alpha(theme.palette.common.white, 0.4),
            borderRadius: 8,
            minWidth: 'auto',
            '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.4),
            },
            '&:active': {
                backgroundColor: alpha(theme.palette.common.white, 0.4),
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
            fontSize: '10px',
            lineHeight: '10px',
            color: MaskColors.light.text.secondary,
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
        },
        copyButton: {
            marginLeft: theme.spacing(0.5),
            color: MaskColors.light.text.secondary,
            padding: 0,
        },
        related: {
            whiteSpace: 'break-spaces',
            lineBreak: 'anywhere',
        },
        ens: {
            whiteSpace: 'nowrap',
            padding: theme.spacing(0.25, 0.5),
            marginRight: 6,
            fontSize: 12,
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
            {address}
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
    const position = useWindowScroll()
    const [hideToolTip, setHideToolTip] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleEndScroll = debounce(() => setHideToolTip(false), 3000)

        const onScroll = () => {
            setHideToolTip(true)
            handleEndScroll()
        }

        const menu = ref.current?.querySelector('[role="menu"]')?.parentElement
        menu?.addEventListener('scroll', onScroll)
        return () => menu?.removeEventListener('scroll', onScroll)
    }, [ref.current, nextIdBindings])

    const [menu, openMenu, closeMenu] = useMenuConfig(
        nextIdBindings
            .sort((x) => (x.platform === NextIDPlatform.LENS ? -1 : 0))
            .map((x, i) => {
                const Icon = resolveNextIDPlatformIcon(x.platform)
                return (
                    <SocialTooltip key={i} platform={x.source} hidden={hideToolTip}>
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
                                return openWindow(resolveNextIDPlatformLink(x.platform, x.identity, x.name))
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

    useEffect(closeMenu, [position])

    const platformIcons = useMemo(() => {
        return uniqBy(nextIdBindings, (x) => x.platform)
            .sort((x) => (x.platform === NextIDPlatform.LENS ? -1 : 0))
            .map((x) => resolveNextIDPlatformIcon(x.platform))
            .filter(isNonNull)
            .slice(0, 3)
    }, [nextIdBindings])

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
