import { Icons } from '@masknet/icons'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Link, MenuItem, Select, Tooltip, TooltipProps, Typography } from '@mui/material'
import { FC, memo, ReactNode, useRef } from 'react'
import { useTip } from '../contexts/index.js'
import { Translate, useI18N } from '../locales/index.js'
import type { TipsAccount } from '../types/index.js'

const useStyles = makeStyles<{}, 'icon'>()((theme, _, refs) => {
    return {
        root: {
            height: 48,
            flexGrow: 1,
            marginLeft: theme.spacing(1),
        },
        menuItem: {
            height: 32,
            color: theme.palette.maskColor.main,
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0, 0.5),
            '&:not(:first-of-type)': {
                marginTop: theme.spacing(1),
            },
        },
        text: {
            fontWeight: 700,
            marginLeft: theme.spacing(0.5),
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
        },
        menu: {
            padding: theme.spacing(1.5),
            borderRadius: theme.spacing(2),
        },
        icon: {
            width: 20,
            height: 20,
        },
        link: {
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 0,
        },
        actionIcon: {
            marginLeft: theme.spacing(0.5),
            color: theme.palette.maskColor.main,
        },
        checkIcon: {
            marginLeft: 'auto',
            color: '#60DFAB',
            filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        },
    }
})

const pluginIconMap: Record<NetworkPluginID, ReactNode> = {
    [NetworkPluginID.PLUGIN_EVM]: (
        <Icons.ETHBlue
            size={20}
            style={{
                filter: 'drop-shadow(0px 6px 12px rgba(98, 126, 234, 0.2))',
                backdropFilter: 'blur(16px)',
            }}
        />
    ),
    [NetworkPluginID.PLUGIN_FLOW]: (
        <Icons.Flow
            size={20}
            style={{
                filter: 'drop-shadow(0px 6px 12px rgba(25, 251, 155, 0.2))',
                backdropFilter: 'blur(16px)',
            }}
        />
    ),
    [NetworkPluginID.PLUGIN_SOLANA]: (
        <Icons.Solana
            size={20}
            style={{
                filter: 'drop-shadow(0px 6px 12px rgba(25, 251, 155, 0.2))',
                backdropFilter: 'blur(16px)',
            }}
        />
    ),
}

interface SourceTooltipProps extends Omit<TooltipProps, 'title'> {
    platform?: 'facebook' | 'twitter' | 'next_id'
    source?: 'ens' | 'rss3'
}

const SourceTooltip: FC<SourceTooltipProps> = ({ platform, source, children }) => {
    return (
        <Tooltip
            disableInteractive
            title={
                <Typography fontSize={14} lineHeight="18px">
                    <Translate.source_tooltip
                        values={{ source: source ?? '' }}
                        components={{
                            Link: <Typography component="span" color={(theme) => theme.palette.maskColor.primary} />,
                        }}
                        context={platform}>
                        {children}
                    </Translate.source_tooltip>
                </Typography>
            }
            arrow
            PopperProps={{
                disablePortal: true,
            }}>
            {children}
        </Tooltip>
    )
}

const TipsAccountSource: FC<{ tipsAccount: TipsAccount }> = ({ tipsAccount }) => {
    const { classes, cx } = useStyles({})
    if (tipsAccount.verified)
        return (
            <SourceTooltip platform="next_id">
                <Icons.NextIDMini className={cx(classes.actionIcon, classes.icon)} />
            </SourceTooltip>
        )
    if (tipsAccount.isSocialAddress) {
        return (
            <SourceTooltip platform="twitter">
                <Icons.TwitterRound className={cx(classes.actionIcon, classes.icon)} />
            </SourceTooltip>
        )
    }
    return null
}

export const RecipientSelect: FC = memo(() => {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const selectRef = useRef(null)
    const { recipient, recipients, setRecipient, isSending } = useTip()
    const recipientAddress = recipient?.address
    const { Others } = useWeb3State()
    const chainId = useChainId()

    return (
        <Select
            className={classes.root}
            ref={selectRef}
            value={recipientAddress}
            disabled={isSending}
            classes={{ select: classes.select }}
            onChange={(e) => {
                setRecipient(e.target.value)
            }}
            MenuProps={{
                classes: {
                    list: classes.menu,
                },
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                },
                container: selectRef.current,
                anchorEl: selectRef.current,
                BackdropProps: {
                    invisible: true,
                },
            }}>
            {recipients.map((tipsAccount) => (
                <MenuItem className={classes.menuItem} key={tipsAccount.address} value={tipsAccount.address}>
                    {pluginIconMap[tipsAccount.pluginId]}
                    <Typography component="span" className={classes.text}>
                        {tipsAccount.name || tipsAccount.address}
                    </Typography>
                    <Link
                        className={cx(classes.link, classes.actionIcon, classes.icon)}
                        onClick={(e) => e.stopPropagation()}
                        href={Others?.explorerResolver.addressLink(chainId, tipsAccount.address) ?? ''}
                        target="_blank"
                        title={t.view_on_explorer()}
                        rel="noopener noreferrer">
                        <Icons.LinkOut size={20} />
                    </Link>
                    <TipsAccountSource tipsAccount={tipsAccount} />
                    {Others?.isSameAddress(tipsAccount.address, recipientAddress) ? (
                        <Icons.CheckCircle className={cx(classes.checkIcon, classes.icon)} />
                    ) : null}
                </MenuItem>
            ))}
        </Select>
    )
})
