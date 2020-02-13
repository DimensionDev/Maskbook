import React, { useRef } from 'react'
import {
    TypedMessage,
    withMetadata,
    readTypedMessageMetadataUntyped,
} from '../../../../extension/background-script/CryptoServices/utils'
import MaskbookPluginWrapper from '../../../MaskbookPluginWrapper'
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
import { useStylesExtends, or } from '../../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import { PortalShadowRoot } from '../../../../utils/jss/ShadowRootPortal'
import { useI18N } from '../../../../utils/i18n-next-ui'

const useStyles = makeStyles(theme =>
    createStyles({
        line: {
            padding: theme.spacing(1, 0),
        },
    }),
)

interface RedPacketInDecryptedPostProps
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
    message: TypedMessage
    postIdentifier?: PostIdentifier<ProfileIdentifier>
}

const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export default function RedPacketInDecryptedPost(props: RedPacketInDecryptedPostProps) {
    const [loading, setLoading] = React.useState(false)
    const [claiming, setClaiming] = React.useState<Claiming>(null)
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
    return (
        <div>
            <RedPacketInDecryptedPostCard {...props} loading={loading} claiming={claiming} onClick={onClick} />
            <RedPacketInDecryptedPostClaimDialog
                {...props}
                claiming={claiming}
                open={!!claiming}
                onAbortClaiming={abortClaiming}
                onClaimRedPacket={claimRedPacket}
                walletAddress={[selectedWalletAddress, setSelectedWalletAddress]}
            />
        </div>
    )
}
type Claiming = {
    rpid: RedPacketRecord['red_packet_id']
    wallets: WalletRecord[]
} | null
export function RedPacketInDecryptedPostCard(
    props: RedPacketInDecryptedPostProps & {
        loading: boolean
        claiming: Claiming
        onClick: (state: RedPacketStatus, rpid: RedPacketRecord['red_packet_id']) => void
    },
) {
    const { message, postIdentifier, loading, claiming, onClick } = props
    const storybookDebugging: boolean = readTypedMessageMetadataUntyped<boolean>(
        message.meta,
        'storybook.no-side-effect',
        // @ts-ignore https://github.com/vultix/ts-results/issues/4
    ).else(false)
    const jsx = message
        ? withMetadata(message.meta, 'com.maskbook.red_packet:1', r => (
              <MaskbookPluginWrapper width={400} pluginName="Red Packet">
                  <RedPacketWithState
                      loading={loading || !!claiming}
                      onClick={onClick}
                      unknownRedPacket={storybookDebugging ? undefined : r}
                      redPacket={storybookDebugging ? (r as any) : undefined}
                      from={postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined}
                  />
              </MaskbookPluginWrapper>
          ))
        : null
    return <>{jsx}</>
}
export function RedPacketInDecryptedPostClaimDialog(
    props: RedPacketInDecryptedPostProps & {
        onAbortClaiming(): void
        onClaimRedPacket: (walletAddress: WalletRecord['address'], rpid?: RedPacketRecord['red_packet_id']) => void
        claiming: Claiming
        walletAddress: [string | undefined, (val: string | undefined) => void]
        open: boolean
    },
) {
    const { t } = useI18N()
    const [selectedWalletAddress, setSelectedWalletAddress] = or(
        props.walletAddress,
        React.useState<undefined | string>(),
    )
    const claiming = props.claiming
    const classes = useStylesExtends(useStyles(), props)
    return (
        <ResponsiveDialog
            className={classes.dialog}
            classes={{
                container: classes.container,
                paper: classes.paper,
            }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            container={PortalShadowRoot}
            disableAutoFocus
            disableEnforceFocus
            onEscapeKeyDown={props.onAbortClaiming}
            BackdropProps={{
                className: classes.backdrop,
            }}>
            <DialogTitle className={classes.header}>
                <IconButton classes={{ root: classes.close }} onClick={props.onAbortClaiming}>
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
                    onClick={() => props.onClaimRedPacket(selectedWalletAddress!, claiming?.rpid)}>
                    {t('ok')}
                </Button>
            </DialogActions>
        </ResponsiveDialog>
    )
}
