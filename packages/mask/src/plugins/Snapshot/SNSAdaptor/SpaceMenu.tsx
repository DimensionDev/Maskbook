import type { FC, RefObject } from 'react'
import { isEqual } from 'lodash-es'
import { useI18N } from '../../../utils/index.js'
import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { Avatar, MenuItem, Stack, Typography, Divider } from '@mui/material'
import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    menu: {
        minWidth: 320,
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 4px 30px rgba(255, 255, 255, 0.15)'
                : '0px 4px 30px rgba(0, 0, 0, 0.1)',
        borderRadius: 16,
    },
    menuItem: {
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        height: 36,
        padding: '0 12px',
    },
    itemText: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'space-around',
        gap: theme.spacing(1),
        alignItems: 'center',
        overflow: 'hidden',
    },
    itemCheckout: {
        display: 'flex',
        alignItems: 'center',
    },
    name: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    coinIcon: {
        marginRight: 4,
        width: 20,
        height: 20,
    },
    checkedIcon: {
        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        color: theme.palette.maskColor.primary,
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    groupName: {
        height: 18,
        marginTop: 5,
        fontWeight: 700,
        fontSize: 14,
        padding: '0 12px',
    },
    divider: {
        margin: theme.spacing(1, 0),
        width: 'calc(100% - 24px)',
        color: theme.palette.maskColor.line,
        borderColor: theme.palette.maskColor.line,
        position: 'relative',
        left: 12,
    },
}))

export interface SpaceMenuProps {
    options: Array<DAOResult<ChainId.Mainnet>>
    currentOption?: DAOResult<ChainId.Mainnet>
    onSelect(index: number): void
    containerRef: RefObject<HTMLElement>
    spaceMenuOpen: boolean
    setSpaceMenuOpen: (a: boolean) => void
    disablePortal?: boolean
    disableScrollLock?: boolean
}

export const SpaceMenu: FC<SpaceMenuProps> = ({
    options,
    currentOption,
    onSelect,
    containerRef,
    spaceMenuOpen,
    setSpaceMenuOpen,
    disablePortal,
    disableScrollLock,
}) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    return (
        <ShadowRootMenu
            anchorEl={containerRef.current}
            open={spaceMenuOpen}
            disablePortal={disablePortal}
            disableScrollLock={disableScrollLock}
            PaperProps={{
                className: classes.menu,
            }}
            onClose={() => setSpaceMenuOpen(false)}>
            <div key="rss3" className={classes.group}>
                <Typography className={classes.groupName}>{t('plugin_snapshot_space')}</Typography>
                <Divider className={classes.divider} />
                {options.map((x, i) => {
                    const selected = isEqual(x, currentOption)
                    return (
                        <MenuItem className={classes.menuItem} key={i} onClick={() => onSelect(i)}>
                            <Avatar className={classes.coinIcon} src={x.avatar} alt={x.spaceId} />
                            <Stack className={classes.itemText}>
                                <Typography
                                    fontSize={14}
                                    fontWeight={700}
                                    flexGrow={1}
                                    overflow="hidden"
                                    textOverflow="ellipsis">
                                    <span className={classes.name}>{x.spaceName}</span>
                                </Typography>
                                <div className={classes.itemCheckout}>
                                    {selected ? <Icons.CheckCircle size={20} className={classes.checkedIcon} /> : null}
                                </div>
                            </Stack>
                        </MenuItem>
                    )
                })}
            </div>
        </ShadowRootMenu>
    )
}
