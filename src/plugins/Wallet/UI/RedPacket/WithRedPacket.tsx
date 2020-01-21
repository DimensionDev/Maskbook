import React, { useRef } from 'react'
import { TypedMessageText, withMetadata } from '../../../../extension/background-script/CryptoServices/utils'
import StructuredPluginWrapper from '../../../../components/InjectedComponents/StructuredMessage/StructuredPluginWrapper'
import { RedPacketWithState } from '../Dashboard/Components/RedPacket'
import { RedPacketRecord, RedPacketStatus, WalletRecord } from '../../database/types'
import Services from '../../../../extension/service'
import { PostIdentifier, ProfileIdentifier } from '../../../../database/type'
import { getPostUrl } from '../../../../social-network-provider/twitter.com/utils/url'
import {
    withMobileDialog,
    Dialog,
    makeStyles,
    createStyles,
    DialogTitle,
    IconButton,
    Typography,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import { PortalShadowRoot } from '../../../../utils/jss/ShadowRootPortal'
import { geti18nString } from '../../../../utils/i18n'

const useStyles = makeStyles(theme =>
    createStyles({
        line: {
            padding: theme.spacing(1, 0),
        },
    }),
)

interface WithRedPacketProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
        | 'label'
        | 'title'
    > {
    renderItem?: TypedMessageText | null
    postIdentifier?: PostIdentifier<ProfileIdentifier>
}

const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export default function WithRedPacket(props: WithRedPacketProps) {
    const { renderItem, postIdentifier } = props
    const classes = useStylesExtends(useStyles(), props)
    const [loading, setLoading] = React.useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const [claiming, setClaiming] = React.useState<{
        rpid: RedPacketRecord['red_packet_id']
        wallets: WalletRecord[]
    } | null>(null)
    const [selectedWalletAddress, setSelectedWalletAddress] = React.useState<undefined | string>(undefined)

    const abortClaiming = () => {
        setLoading(false)
        setClaiming(null)
    }

    const claimRedPacket = (walletAddress: WalletRecord['address'], rpid?: RedPacketRecord['red_packet_id']) => {
        setClaiming(null)
        return Services.Plugin.invokePlugin(
            'maskbook.red_packet',
            'claimRedPacket',
            { redPacketID: rpid ?? claiming?.rpid! },
            walletAddress,
        )
            .catch(e => Services.Welcome.openOptionsPage(`/wallets/error?reason=${e.message}`))
            .finally(() => setLoading(false))
    }

    const onClick = async (state: RedPacketStatus, rpid: RedPacketRecord['red_packet_id']) => {
        if (!rpid) return
        if (state === 'incoming' || state === 'normal') {
            setLoading(true)
            try {
                const [wallets] = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
                if (!wallets[0]) {
                    Services.Welcome.openOptionsPage('/wallets/error?reason=nowallet')
                    throw new Error('Claim failed')
                }
                if (wallets.length > 1) setClaiming({ rpid, wallets })
                else claimRedPacket(wallets[0].address, rpid)
            } catch {
                setLoading(false)
            }
        } else {
            Services.Welcome.openOptionsPage(`/wallets/redpacket?id=${rpid}`)
        }
    }
    const Component = renderItem
        ? withMetadata(renderItem.meta, 'com.maskbook.red_packet:1', r => (
              <StructuredPluginWrapper width={400} pluginName="Red Packet">
                  <RedPacketWithState
                      loading={loading || !!claiming}
                      onClick={onClick}
                      unknownRedPacket={r}
                      from={postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined}
                  />
              </StructuredPluginWrapper>
          ))
        : null
    return (
        <div>
            {Component}
            {claiming && (
                <ResponsiveDialog
                    className={classes.dialog}
                    classes={{
                        container: classes.container,
                        paper: classes.paper,
                    }}
                    open={true}
                    scroll="paper"
                    fullWidth
                    maxWidth="sm"
                    container={() => rootRef.current}
                    disablePortal
                    disableAutoFocus
                    disableEnforceFocus
                    onEscapeKeyDown={abortClaiming}
                    BackdropProps={{
                        className: classes.backdrop,
                    }}>
                    <DialogTitle className={classes.header}>
                        <IconButton classes={{ root: classes.close }} onClick={abortClaiming}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <Typography className={classes.title} style={{ display: 'inline' }} variant="inherit">
                            Select Wallet
                        </Typography>
                    </DialogTitle>
                    <DialogContent className={classes.content}>
                        <div className={classes.line}>
                            <FormControl variant="filled" className={classes.input} fullWidth>
                                <InputLabel>Wallet</InputLabel>
                                <Select
                                    onChange={e => setSelectedWalletAddress(e.target.value as string)}
                                    MenuProps={{ container: PortalShadowRoot }}
                                    value={selectedWalletAddress || ''}>
                                    {claiming?.wallets.map(x => (
                                        <MenuItem key={x.address} value={x.address}>
                                            {x.name} ({x.address})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Button
                            className={classes.button}
                            style={{ marginLeft: 'auto' }}
                            color="primary"
                            variant="contained"
                            onClick={() => claimRedPacket(selectedWalletAddress!, claiming?.rpid)}>
                            {geti18nString('ok')}
                        </Button>
                    </DialogActions>
                </ResponsiveDialog>
            )}
        </div>
    )
}
