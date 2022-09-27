import { FC, useContext, useRef } from 'react'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { Link, MenuItem, Select } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../locales/index.js'
// TODO: move to @masknet/shared
import { CopyIconButton } from '../../../../NextID/components/CopyIconButton/index.js'
import { TipsContext } from '../../Context/TipsContext.js'

const useStyles = makeStyles<{}, 'icon'>()((theme, _, refs) => {
    return {
        address: {
            height: 48,
            flexGrow: 1,
            marginLeft: theme.spacing(1),
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
        },
        menuItem: {
            height: 40,
        },
        icon: {},
        link: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        actionIcon: {
            marginLeft: theme.spacing(1),
            color: theme.palette.text.secondary,
            height: 24,
            width: 24,
        },
        checkIcon: {
            marginLeft: 'auto',
            color: '#60DFAB',
        },
    }
})

export const RecipientSelect: FC = () => {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const selectRef = useRef(null)
    const { recipient, recipients, setRecipient, loading } = useContext(TipsContext)
    const { Others } = useWeb3State()
    const chainId = useChainId()
    return (
        <Select
            className={classes.address}
            ref={selectRef}
            value={recipient}
            disabled={loading}
            classes={{ select: classes.select }}
            onChange={(e) => {
                setRecipient(e.target.value)
            }}
            MenuProps={{
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
            {recipients.map((recipient) => (
                <MenuItem className={classes.menuItem} key={recipient.address} value={recipient.address}>
                    {recipient.name || Others?.formatAddress?.(recipient.address, 4) || recipient.address}
                    <CopyIconButton className={cx(classes.actionIcon, classes.icon)} text={recipient.address} />
                    <Link
                        className={cx(classes.link, classes.icon)}
                        onClick={(e) => e.stopPropagation()}
                        href={Others?.explorerResolver.addressLink(chainId, recipient.address) ?? ''}
                        target="_blank"
                        title={t.view_on_explorer()}
                        rel="noopener noreferrer">
                        <Icons.LinkOut className={classes.actionIcon} />
                    </Link>
                    {recipient.verified ? <Icons.Verified className={cx(classes.actionIcon, classes.icon)} /> : null}
                    {Others?.isSameAddress(recipient.address, recipient.address) ? (
                        <Icons.Check className={cx(classes.checkIcon, classes.icon)} />
                    ) : null}
                </MenuItem>
            ))}
        </Select>
    )
}
