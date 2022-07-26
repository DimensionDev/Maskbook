import { Gear, ArrowDrop, LinkOut, NextIdPersonaVerified, Selected } from '@masknet/icons'
import { ReversedAddress } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles, MaskTabList, ShadowRootMenu } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { Button, Link, MenuItem, Typography, Tab } from '@mui/material'
import { uniqBy } from 'lodash-unified'
import { HTMLProps, ReactNode, useState } from 'react'
import { useSharedI18N } from '../../../locales'

const TAB_WIDTH = 126
const useStyles = makeStyles()((theme) => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        padding: '16px 16px 0 16px',
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    tabs: {
        display: 'flex',
        position: 'relative',
    },
    track: {
        flexGrow: 1,
        display: 'flex',
        overflow: 'auto',
        'scrollbar-width': 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    button: {
        height: 35,
        minWidth: TAB_WIDTH,
        padding: theme.spacing(0, 2.5),
        borderRadius: '12px 12px 0px 0px',
        flexShrink: 0,
        border: '1px solid transparent',
        background: 'none',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bottom,
        },
    },
    normal: {
        boxSizing: 'border-box',
        color: theme.palette.maskColor.secondaryDark,
        border: '1px solid transparent',
    },
    selected: {
        position: 'relative',
        backgroundColor: theme.palette.maskColor.bottom,
        zIndex: 10,
        color: theme.palette.maskColor.main,
        '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
        },
    },
    controllers: {
        display: 'flex',
        flexGrow: 0,
        alignItems: 'center',
    },
    controller: {
        display: 'flex',
        color: theme.palette.maskColor.second,
        border: 'none',
        borderRadius: 0,
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
            border: 'none !important',
            borderBottomColor: theme.palette.divider,
            color: `${theme.palette.text.primary} !important`,
            backgroundColor: theme.palette.background.paper,
        },
        '&[disabled]': {
            color: theme.palette.maskColor.second,
        },
    },
    walletButton: {
        padding: 0,
        fontSize: '18px',
        minWidth: 0,
        background: 'transparent',
        '&:hover': {
            background: 'none',
        },
    },
    settingItem: {
        display: 'flex',
        alignItems: 'center',
    },
    walletItem: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 18,
        fontWeight: 700,
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    addressItem: {
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        cursor: 'pointer',
        marginTop: 2,
        zIndex: 1,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    linkIcon: {
        color: theme.palette.maskColor.second,
        fontSize: '20px',
        margin: '4px 2px 0 2px',
    },
}))

interface TabOption<T> {
    id: T
    label: string
}

export interface ConcealableTabsProps<T> extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
    tabs: Array<TabOption<T>>
    currentTab: string
    onChange(event: unknown, value: string): void
    tail?: ReactNode
    addressList: Array<SocialAddress<NetworkPluginID>>
    selectedAddress?: SocialAddress<NetworkPluginID>
    onSelectAddress: (address: SocialAddress<NetworkPluginID>) => void
}

export function ConcealableTabs<T extends number | string>({
    className,
    tabs,
    currentTab,
    tail,
    onChange,
    addressList,
    selectedAddress,
    onSelectAddress,
    ...rest
}: ConcealableTabsProps<T>) {
    const { classes } = useStyles()
    const t = useSharedI18N()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const onClose = () => setAnchorEl(null)

    const onSelect = (option: SocialAddress<NetworkPluginID>) => {
        onSelectAddress(option)
        onClose()
    }

    const handleOpenDialog = () => {
        CrossIsolationMessages.events.requestWeb3ProfileDialog.sendToAll({
            open: true,
        })
    }

    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)

    return (
        <div className={classes.container} {...rest}>
            <div className={classes.title}>
                <div className={classes.walletItem}>
                    <Button
                        id="demo-positioned-button"
                        variant="text"
                        size="small"
                        onClick={onOpen}
                        className={classes.walletButton}>
                        <Typography fontSize="18px" fontWeight={700} color="#07101b">
                            {selectedAddress?.type === SocialAddressType.KV ||
                            selectedAddress?.type === SocialAddressType.ADDRESS ? (
                                <ReversedAddress
                                    fontSize="18px"
                                    address={selectedAddress.address}
                                    pluginId={selectedAddress.networkSupporterPluginID}
                                />
                            ) : (
                                selectedAddress?.label
                            )}
                        </Typography>
                        <Link
                            className={classes.link}
                            href={
                                selectedAddress
                                    ? explorerResolver.addressLink(ChainId.Mainnet, selectedAddress?.address) ?? ''
                                    : ''
                            }
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOut color="#767f8d" size={20} />
                        </Link>
                        <ArrowDrop color="#07101b" />
                    </Button>
                    <ShadowRootMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        PaperProps={{
                            style: {
                                maxHeight: 192,
                                width: 248,
                            },
                        }}
                        aria-labelledby="demo-positioned-button"
                        onClose={() => setAnchorEl(null)}>
                        {uniqBy(addressList ?? [], (x) => x.address.toLowerCase()).map((x) => {
                            return (
                                <MenuItem key={x.address} value={x.address} onClick={() => onSelect(x)}>
                                    <div className={classes.menuItem}>
                                        <div className={classes.addressItem}>
                                            {x?.type === SocialAddressType.KV ||
                                            x?.type === SocialAddressType.ADDRESS ? (
                                                <ReversedAddress
                                                    address={x.address}
                                                    pluginId={x.networkSupporterPluginID}
                                                />
                                            ) : (
                                                <Typography fontSize="14px" fontWeight={700}>
                                                    {x.label}
                                                </Typography>
                                            )}
                                            <Link
                                                className={classes.link}
                                                href={
                                                    selectedAddress
                                                        ? explorerResolver.addressLink(ChainId.Mainnet, x?.address) ??
                                                          ''
                                                        : ''
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <LinkOut className={classes.linkIcon} />
                                            </Link>
                                            {x?.type === SocialAddressType.KV && (
                                                <NextIdPersonaVerified color="#3dc233" />
                                            )}
                                        </div>
                                        {isSameAddress(selectedAddress?.address, x.address) && (
                                            <Selected color="#1c68f3" />
                                        )}
                                    </div>
                                </MenuItem>
                            )
                        })}
                    </ShadowRootMenu>
                </div>
                <div className={classes.settingItem}>
                    <Typography fontSize="14px" fontWeight={700} marginRight="8px" color="#767f8d">
                        {t.powered_by()}
                    </Typography>
                    <Typography fontSize="14px" fontWeight={700} marginRight="8px" color="#07101b">
                        {t.mask_network()}
                    </Typography>
                    <Gear onClick={handleOpenDialog} sx={{ cursor: 'pointer' }} />
                </div>
            </div>
            <div className={classes.tabs}>
                <TabContext value={currentTab}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                        {tabs.map((tab) => (
                            <Tab key={tab.id} label={tab.label} value={tab.id} />
                        ))}
                    </MaskTabList>
                </TabContext>
            </div>
        </div>
    )
}
