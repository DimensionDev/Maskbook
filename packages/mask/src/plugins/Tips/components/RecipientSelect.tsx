import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { Link, MenuItem, Select } from '@mui/material'
import { useI18N } from '../locales'
import { FC, useRef } from 'react'
import { CopyIconButton } from '../../NextID/components/CopyIconButton'
import { useTip } from '../contexts'
import { CheckIcon, LinkOutIcon, VerifiedIcon } from '@masknet/icons'

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
    const { recipient, recipients, setRecipient, isSending } = useTip()
    const { Others } = useWeb3State()
    const chainId = useChainId()
    return (
        <Select
            className={classes.address}
            ref={selectRef}
            value={recipient}
            disabled={isSending}
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
            {recipients.map((addressConfig) => (
                <MenuItem className={classes.menuItem} key={addressConfig.address} value={addressConfig.address}>
                    {addressConfig.name || Others?.formatAddress?.(addressConfig.address, 4) || addressConfig.address}
                    <CopyIconButton className={cx(classes.actionIcon, classes.icon)} text={addressConfig.address} />
                    <Link
                        className={cx(classes.link, classes.icon)}
                        onClick={(e) => e.stopPropagation()}
                        href={Others?.explorerResolver.addressLink(chainId, addressConfig.address) ?? ''}
                        target="_blank"
                        title={t.view_on_explorer()}
                        rel="noopener noreferrer">
                        <LinkOutIcon className={classes.actionIcon} />
                    </Link>
                    {addressConfig.verified ? <VerifiedIcon className={cx(classes.actionIcon, classes.icon)} /> : null}
                    {Others?.isSameAddress(addressConfig.address, recipient) ? (
                        <CheckIcon className={cx(classes.checkIcon, classes.icon)} />
                    ) : null}
                </MenuItem>
            ))}
        </Select>
    )
}
