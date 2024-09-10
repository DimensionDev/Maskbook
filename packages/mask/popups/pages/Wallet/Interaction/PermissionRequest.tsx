import { makeStyles } from '@masknet/theme'
import type { InteractionItemProps } from './interaction.js'
import { Checkbox, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { useId, useState } from 'react'
import { useWalletName } from '../../../../../shared/src/UI/components/WalletStatusBar/hooks/useWalletName.js'
import { NetworkPluginID } from '@masknet/shared-base'
import type { EIP2255RequestedPermission } from '@masknet/sdk'
import Services from '#services'
import { useTitle } from 'react-use'
import type { JsonRpcResponseWithResult } from 'web3-types'

const useStyle = makeStyles()({
    title: { fontSize: 28, marginTop: 16 },
    subtitle: { fontSize: 16, marginTop: 6 },
    origin: {
        border: '1px solid gray',
        textAlign: 'center',
        borderRadius: 10,
        fontSize: 'large',
        padding: '0.25em',
        margin: '0.5em',
    },
    address: { fontFamily: 'monospace', fontSize: 12 },
})
export function PermissionRequest(props: InteractionItemProps) {
    const { setConfirmAction } = props
    const { classes } = useStyle()
    const t = useMaskSharedTrans()
    const id = useId()
    const origin = props.currentRequest.origin
    const allWallets = useWallets()
    const [selectedWallet, setSelectedWallet] = useState<string[]>([allWallets[0].address])
    const { Message } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    useTitle(t.wallet_sdk_connect_title())

    if (!origin) return null

    setConfirmAction(async () => {
        const result: EIP2255RequestedPermission[] = await Services.Wallet.sdk_grantEIP2255Permission(
            props.currentRequest.origin!,
            selectedWallet,
        )
        await Message!.approveRequestWithResult(props.currentRequest.ID, {
            result: result as any,
            jsonrpc: '2.0',
            id: 0,
        } satisfies JsonRpcResponseWithResult)
    })

    return (
        <>
            <Typography variant="h1" className={classes.title}>
                {t.wallet_sdk_connect_title()}
            </Typography>
            <Typography variant="h2" className={classes.subtitle}>
                {t.wallet_sdk_connect_subtitle()}
            </Typography>
            <Typography variant="h2" className={classes.origin}>
                {origin.startsWith('https://') ? origin.slice('https://'.length) : origin}
            </Typography>
            <Typography variant="h2" className={classes.subtitle}>
                {t.wallet_sdk_connect_warning_title()}
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemText primary={t.wallet_sdk_connect_warning_1()} />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t.wallet_sdk_connect_warning_2()} />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t.wallet_sdk_connect_warning_3()} />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t.wallet_sdk_connect_warning_4()} />
                </ListItem>
            </List>
            <List dense disablePadding>
                {allWallets.map((wallet) => {
                    const labelId = `${id}-${wallet.address}`

                    return (
                        <ListItem disablePadding key={wallet.address}>
                            <ListItemButton
                                role={undefined}
                                onClick={() => {
                                    const set = new Set(selectedWallet)
                                    if (set.has(wallet.address)) set.delete(wallet.address)
                                    else set.add(wallet.address)
                                    setSelectedWallet([...set])

                                    if (set.size === 0) props.setConfirmDisabled(true)
                                    else props.setConfirmDisabled(false)
                                }}
                                dense>
                                <Checkbox
                                    edge="start"
                                    checked={selectedWallet.includes(wallet.address)}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                                <WalletListItem address={wallet.address} id={labelId} className={classes.address} />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </>
    )
}
function WalletListItem(props: { address: string; id: string; className: string }) {
    const name = useWalletName(props.address)
    return (
        <ListItemText
            secondaryTypographyProps={{ className: props.className }}
            id={props.id}
            primary={name}
            secondary={props.address}
        />
    )
}
