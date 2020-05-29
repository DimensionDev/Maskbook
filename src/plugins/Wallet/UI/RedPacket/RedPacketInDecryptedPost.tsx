import React, { useRef } from 'react'
import {
    TypedMessage,
    withMetadata,
    readTypedMessageMetadataUntyped,
} from '../../../../extension/background-script/CryptoServices/utils'
import MaskbookPluginWrapper from '../../../MaskbookPluginWrapper'
import { RedPacketWithState } from '../Dashboard/Components/RedPacket'
import type { RedPacketRecord, RedPacketStatus, WalletRecord } from '../../database/types'
import Services from '../../../../extension/service'
import type { PostIdentifier, ProfileIdentifier } from '../../../../database/type'

import {
    withMobileDialog,
    Dialog,
    makeStyles,
    createStyles,
    DialogTitle,
    IconButton,
    Typography,
    DialogContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Divider,
} from '@material-ui/core'
import { useStylesExtends, or } from '../../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../../components/InjectedComponents/DialogDismissIcon'
import { PortalShadowRoot } from '../../../../utils/jss/ShadowRootPortal'
import { useI18N } from '../../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../../utils/jss/ShadowRootDialog'
import { getPostUrl } from '../../../../social-network/utils/getPostUrl'
import { RedPacketMetaKey } from '../../RedPacketMetaKey'
import type { PluginSuccessDecryptionComponentProps } from '../../../plugin'
import { useWalletDataSource } from '../../../shared/useWallet'

const useStyles = makeStyles((theme) =>
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
        >,
        PluginSuccessDecryptionComponentProps {}

export default function RedPacketInDecryptedPost(props: RedPacketInDecryptedPostProps) {
    const [loading, setLoading] = React.useState(false)
    const [claiming, setClaiming] = React.useState<Claiming>(null)
    const [selectedWalletAddress, setSelectedWalletAddress] = React.useState<undefined | string>(undefined)

    const abortClaiming = () => {
        setLoading(false)
        setClaiming(null)
    }

    const claimRedPacket = (
        walletAddress: WalletRecord['address'],
        rpid?: RedPacketRecord['red_packet_id'],
        setAsDefault?: boolean,
    ) => {
        setClaiming(null)
        return Services.Plugin.invokePlugin(
            'maskbook.red_packet',
            'claimRedPacket',
            { redPacketID: rpid ?? claiming?.rpid! },
            walletAddress,
            setAsDefault,
        )
            .catch((e) => Services.Welcome.openOptionsPage(`/wallets/error?reason=${e.message}`))
            .finally(() => setLoading(false))
    }
    const [wallets, tokens, onRequireNewWallet] = useWalletDataSource()

    const onClick = async (state: RedPacketStatus, rpid: RedPacketRecord['red_packet_id']) => {
        if (!rpid) return
        if (state === 'incoming' || state === 'normal') {
            setLoading(true)
            try {
                if (wallets === 'loading') throw new Error('Loading')
                if (!wallets[0]) {
                    onRequireNewWallet()
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
    const { t } = useI18N()
    const { message, postIdentifier, loading, claiming, onClick } = props
    const storybookDebugging: boolean = !!process.env.STORYBOOK
    /* without redpacket */
    const jsx = message
        ? withMetadata(message.meta, RedPacketMetaKey, (r) => (
              <MaskbookPluginWrapper width={400} pluginName="Red Packet">
                  {webpackEnv.target === 'WKWebview' ? (
                      <span>{t('feature_redpacket_not_supported')}</span>
                  ) : (
                      <RedPacketWithState
                          loading={loading || !!claiming}
                          onClick={onClick}
                          unknownRedPacket={storybookDebugging ? undefined : r}
                          redPacket={storybookDebugging ? (r as any) : undefined}
                          from={postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined}
                      />
                  )}
              </MaskbookPluginWrapper>
          ))
        : null
    return <>{jsx}</>
}
export function RedPacketInDecryptedPostClaimDialog(
    props: RedPacketInDecryptedPostProps & {
        onAbortClaiming(): void
        onClaimRedPacket: (
            walletAddress: WalletRecord['address'],
            rpid?: RedPacketRecord['red_packet_id'],
            setAsDefault?: boolean,
        ) => void
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
    const [defaultChecked, setDefaultChecked] = React.useState(false)
    const claiming = props.claiming
    const classes = useStylesExtends(useStyles(), props)
    return (
        <ShadowRootDialog
            className={classes.dialog}
            classes={{
                container: classes.container,
                paper: classes.paper,
            }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
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
            <Divider />
            <DialogContent className={classes.content}>
                <div className={classes.line}>
                    <FormControl variant="filled" className={classes.input} fullWidth>
                        <InputLabel>Wallet</InputLabel>
                        <Select
                            onChange={(e) => setSelectedWalletAddress(e.target.value as string)}
                            MenuProps={{ container: PortalShadowRoot }}
                            value={selectedWalletAddress || ''}>
                            {claiming?.wallets.map((x) => (
                                <MenuItem key={x.address} value={x.address}>
                                    {x.name} ({x.address})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </DialogContent>
            <DialogContent className={classes.actions} style={{ display: 'flex' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={defaultChecked}
                            onChange={(e) => setDefaultChecked(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Set as Default"
                />
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto', marginRight: 0, width: 100 }}
                    color="primary"
                    variant="contained"
                    onClick={() => props.onClaimRedPacket(selectedWalletAddress!, claiming?.rpid, defaultChecked)}>
                    {t('ok')}
                </Button>
            </DialogContent>
        </ShadowRootDialog>
    )
}
