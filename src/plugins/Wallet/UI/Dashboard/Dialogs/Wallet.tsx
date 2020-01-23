import React from 'react'
import {
    TextField,
    makeStyles,
    createStyles,
    Typography,
    Divider,
    Chip,
    Box,
    Paper,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
} from '@material-ui/core'
import ArrowBack from '@material-ui/icons/ArrowBack'
import ActionButton from '../../../../../extension/options-page/DashboardComponents/ActionButton'
import { DialogContentItem } from '../../../../../extension/options-page/DashboardDialogs/DialogBase'
import { RedPacket } from '../Components/RedPacket'
import WalletLine from '../Components/WalletLine'
import Services from '../../../../../extension/service'
import { PluginMessageCenter } from '../../../../PluginMessages'
import { RedPacketRecord, WalletRecord, EthereumNetwork } from '../../../database/types'
import useQueryParams from '../../../../../utils/hooks/useQueryParams'
import { ERC20TokenPredefinedData } from '../../../erc20'
import { ERC20WellKnownTokenSelector } from './WalletAddTokenDialogContent'
import Wallet from 'wallet.ts'
import { useHistory, Link } from 'react-router-dom'
import { geti18nString } from '../../../../../utils/i18n'
import { useColorProvider } from '../../../../../utils/theme'
import { formatBalance } from '../../../formatter'

interface WalletSendRedPacketDialogProps {
    onDecline(): void
}

const useSendRedPacketStyles = makeStyles(theme =>
    createStyles({
        body: {
            padding: theme.spacing(1, 0),
        },
        provider: {
            padding: theme.spacing(0.3, 0),
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
    }),
)

export function WalletSendRedPacketDialog(props: WalletSendRedPacketDialogProps) {
    const { onDecline } = props
    const classes = useSendRedPacketStyles()
    return (
        <DialogContentItem
            onExit={onDecline}
            title="Send Red Packet"
            content={
                <>
                    <Typography className={classes.body}>Select the social network to post...</Typography>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {
                            // <ActionButton variant="outlined" color="primary" className={classes.provider} width={240}>
                            //  Open facebook.com
                            // </ActionButton>
                        }
                        {
                            <ActionButton
                                component="a"
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                color="primary"
                                className={classes.provider}
                                width={240}>
                                Open twitter.com
                            </ActionButton>
                        }
                    </div>
                </>
            }></DialogContentItem>
    )
}

interface WalletAddTokenDialogProps {
    onConfirm(token: ERC20TokenPredefinedData[0], userDefined: boolean, network: EthereumNetwork): void
    onDecline(): void
}

const useAddTokenStyles = makeStyles(theme =>
    createStyles({
        textfield: {
            width: '100%',
            padding: theme.spacing(1, 0),
        },
    }),
)

interface TabPanelProps {
    children?: React.ReactNode
    index: any
    value: any
}

export function WalletAddTokenDialog(props: WalletAddTokenDialogProps) {
    const { onConfirm, onDecline } = props

    const classes = useAddTokenStyles()
    const [tabID, setTabID] = React.useState<0 | 1>(0)

    const [wellknown, setWellknown] = React.useState<undefined | ERC20TokenPredefinedData[0]>()
    const [useRinkeby, setRinkeby] = React.useState(false)

    const [address, setTokenAddress] = React.useState('')
    const [decimals, setDecimal] = React.useState(0)
    const [tokenName, setTokenName] = React.useState('')
    const [symbol, setSymbol] = React.useState('')

    const isInvalidAddr = !Wallet.EthereumAddress.isValid(address)
    const isValidInput =
        tabID === 0 ? wellknown === undefined : isInvalidAddr || tokenName.length === 0 || symbol.length === 0
    return (
        <DialogContentItem
            onExit={onDecline}
            title={'Add Token'}
            tabs={
                <Paper square>
                    <Tabs value={tabID} onChange={(e, n) => setTabID(n as any)}>
                        <Tab label="Well-known token" />
                        <Tab label="Add your own token" />
                    </Tabs>
                </Paper>
            }
            content={
                <>
                    {tabID === 0 ? (
                        <ERC20WellKnownTokenSelector
                            selectedItem={[wellknown, setWellknown]}
                            useRinkebyNetwork={[useRinkeby, setRinkeby]}
                        />
                    ) : (
                        <>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useRinkeby}
                                        onChange={e => setRinkeby(e.currentTarget.checked)}
                                        color="primary"
                                    />
                                }
                                label="Use Rinkeby Network"
                            />
                            <TextField
                                required
                                error={isInvalidAddr && !!address.length}
                                className={classes.textfield}
                                label="Contract Address"
                                value={address}
                                onChange={e => setTokenAddress(e.target.value)}></TextField>
                            <TextField
                                required
                                className={classes.textfield}
                                label="Decimal"
                                value={decimals}
                                type="number"
                                inputProps={{ min: 0 }}
                                onChange={e => setDecimal(parseInt(e.target.value))}></TextField>
                            <TextField
                                required
                                className={classes.textfield}
                                label="Name"
                                value={tokenName}
                                onChange={e => setTokenName(e.target.value)}></TextField>
                            <TextField
                                required
                                className={classes.textfield}
                                label="Symbol"
                                value={symbol}
                                onChange={e => setSymbol(e.target.value)}></TextField>
                        </>
                    )}
                </>
            }
            actions={
                <ActionButton
                    disabled={isValidInput}
                    variant="contained"
                    color="primary"
                    onClick={() =>
                        onConfirm(
                            tabID === 0 ? wellknown! : { address, symbol, decimals, name: tokenName },
                            tabID === 0,
                            useRinkeby ? EthereumNetwork.Rinkeby : EthereumNetwork.Mainnet,
                        )
                    }>
                    Add Token
                </ActionButton>
            }></DialogContentItem>
    )
}

interface WalletRedPacketHistoryDialogProps {
    onClick?(packet: RedPacketRecord): void
    onDecline(): void
    walletAddress: string
}

const usePacketHistoryStyles = makeStyles(theme =>
    createStyles({
        paper: {
            backgroundColor: theme.palette.type === 'light' ? '#F7F8FA' : '#343434',
        },
    }),
)

export function WalletRedPacketHistoryDialog(props: WalletRedPacketHistoryDialogProps) {
    const classes = usePacketHistoryStyles()
    const { onClick, onDecline, walletAddress } = props
    const [tabState, setTabState] = React.useState(0)
    const [redPacketRecords, setRedPacketRecords] = React.useState<RedPacketRecord[]>([])

    const filteredRecords = redPacketRecords.filter(record => {
        if (tabState === 0) {
            return record.claim_address === walletAddress
        } else if (tabState === 1) {
            return record.sender_address === walletAddress
        }
        return false
    })

    React.useEffect(() => {
        const updateHandler = () =>
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets', undefined).then(setRedPacketRecords)

        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [tabState])

    return (
        <DialogContentItem
            onExit={onDecline}
            title="Red Packets History"
            tabs={
                <Paper className={classes.paper} square>
                    <Tabs
                        value={tabState}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={(_, s) => setTabState(s)}>
                        <Tab label="Inbound" />
                        <Tab label="Outbound" />
                    </Tabs>
                </Paper>
            }
            content={
                <>
                    {filteredRecords.map(record => (
                        <WalletLine
                            key={record.id}
                            line1={record.send_message}
                            line2={`${record.block_creation_time?.toLocaleString()} from ${record.sender_name}`}
                            onClick={() => onClick?.(record)}
                            invert
                            action={
                                <Typography variant="h6">
                                    {(tabState === 0 && record.claim_amount) || (tabState === 1 && record.send_total)
                                        ? formatBalance(
                                              tabState === 0 ? record.claim_amount! : record.send_total!,
                                              record.raw_payload?.token?.decimals ?? 18,
                                          )
                                        : '0'}{' '}
                                    {record.raw_payload?.token?.name || 'ETH'}
                                </Typography>
                            }
                        />
                    ))}
                </>
            }></DialogContentItem>
    )
}

const useRedPacketDetailStyles = makeStyles(theme =>
    createStyles({
        openBy: {
            margin: theme.spacing(2, 0, 0.5),
        },
        link: {
            display: 'block',
            width: '100%',
            wordBreak: 'break-all',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
    }),
)

interface WalletRedPacketDetailDialogProps {
    redPacket: RedPacketRecord
    onDecline: (() => void) | string
}

export function WalletRedPacketDetailDialog(props: WalletRedPacketDetailDialogProps) {
    const { redPacket, onDecline } = props

    const classes = useRedPacketDetailStyles()
    const sayThanks = () => {
        const user = redPacket._found_in_url_?.match(/(?!\/)[\d\w]+(?=\/status)/)
        const text = `${user ? `@${user}, t`: 'T'}hank you! ${redPacket._found_in_url_}`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener noreferrer')
    }

    return (
        <DialogContentItem
            icon={<ArrowBack />}
            onExit={onDecline}
            title="Red Packet Detail"
            content={
                <>
                    <RedPacket redPacket={redPacket} />
                    {redPacket._found_in_url_ && <ActionButton onClick={sayThanks} style={{display: 'block', margin: 'auto', width: 200}} variant="contained" color="primary">Say Thanks</ActionButton>}
                    {redPacket._found_in_url_ && (
                        <WalletLine
                            onClick={() => window.open(redPacket._found_in_url_, '_blank', 'noopener noreferrer')}
                            line1="Source"
                            line2={
                                <Typography className={classes.link} color="primary">
                                    {redPacket._found_in_url_ || 'Unknown'}
                                </Typography>
                            }
                        />
                    )}
                    <WalletLine
                        line1="From"
                        line2={
                            <>
                                {redPacket.sender_name}{' '}
                                {redPacket.create_transaction_hash && (
                                    <Chip label="Me" variant="outlined" color="secondary" size="small"></Chip>
                                )}
                            </>
                        }
                    />
                    <WalletLine line1="Message" line2={redPacket.send_message} />
                    <Box p={1} display="flex" justifyContent="center">
                        <Typography variant="caption" color="textSecondary">
                            created at {redPacket.block_creation_time?.toLocaleString()}
                        </Typography>
                    </Box>
                </>
            }></DialogContentItem>
    )
}

export function WalletRedPacketDetailDialogWithRouter(props: Pick<WalletRedPacketDetailDialogProps, 'onDecline'>) {
    const { id } = useQueryParams(['id'])
    const [redPacket, setRedPacket] = React.useState<RedPacketRecord | null>(null)
    React.useEffect(() => {
        if (id)
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, id).then(setRedPacket)
    }, [id])
    return redPacket ? <WalletRedPacketDetailDialog redPacket={redPacket} onDecline={props.onDecline} /> : null
}

export function WalletCreateDialog() {
    const [name, setName] = React.useState('')
    const [passphrase, setPassphrase] = React.useState('')
    const history = useHistory()

    const createWallet = () => {
        Services.Plugin.invokePlugin('maskbook.wallet', 'createNewWallet', {
            name,
            passphrase,
        } as Pick<WalletRecord, 'name' | 'passphrase'>).then(() => history.replace('../'))
    }

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                required
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                helperText=" "
                label="Wallet Name"
            />
            <TextField
                required
                type="password"
                style={{ width: '100%', maxWidth: '320px' }}
                variant="outlined"
                label="Password"
                helperText={geti18nString('dashboard_password_helper_text')}
                placeholder={geti18nString('dashboard_password_hint')}
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
            />
        </div>
    )

    return (
        <DialogContentItem
            title={'Create Wallet'}
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" component={'a'} onClick={createWallet}>
                    {geti18nString('create')}
                </ActionButton>
            }></DialogContentItem>
    )
}

const useWalletImportStyles = makeStyles(theme =>
    createStyles({
        box: {
            border: `1px solid ${theme.palette.divider}`,
            marginTop: theme.spacing(2),
        },
    }),
)

export function WalletImportDialog() {
    const [mnemonic, setMnemonic] = React.useState(
        'flag wave term illness equal airport hint item dinosaur opinion special kick',
    )
    const [passphrase, setPassphrase] = React.useState('12345678')
    const [name, setName] = React.useState('Demo wallet')
    const history = useHistory()
    const classes = useWalletImportStyles()

    const importWallet = () => {
        Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
            mnemonic: mnemonic.split(' '),
            passphrase,
            name,
        } as Pick<WalletRecord, 'name' | 'mnemonic' | 'passphrase'>).then(() => history.replace('../'))
    }

    const content = (
        <Box alignSelf="stretch" width="100%">
            <Typography variant="body1">Import a wallet with mnemonic words and password.</Typography>
            <Box display="flex" flexDirection="column" p={1} className={classes.box}>
                <TextField
                    required
                    value={mnemonic}
                    onChange={e => setMnemonic(e.target.value)}
                    label="Mnemonic Words"
                    helperText=" "
                />
                <TextField
                    required
                    value={passphrase}
                    onChange={e => setPassphrase(e.target.value)}
                    label="Password"
                    helperText=" "
                />
                <TextField required value={name} onChange={e => setName(e.target.value)} label="Name" />
            </Box>
        </Box>
    )

    return (
        <DialogContentItem
            title={'Import Wallet'}
            content={content}
            actions={
                <>
                    <span />
                    <ActionButton variant="contained" color="primary" component={'a'} onClick={importWallet}>
                        {geti18nString('import')}
                    </ActionButton>
                </>
            }></DialogContentItem>
    )
}

export function WalletErrorDialog() {
    const { reason } = useQueryParams(['reason'])
    let content
    switch (reason) {
        case 'nowallet':
            content = 'You have no wallet currently. Create or Import one before doing that.'
            break
        case 'Returned error: gas required exceeds allowance (10000000) or always failing transaction':
            content = 'This Red Packet is not claimable. It may have been claimed or refunded.'
            break
        case 'Returned error: insufficient funds for gas * price   value':
            content = 'Your allowance in this wallet is not sufficient to do that.'
            break
        default:
            content = 'Unknown Error.'
            break
    }
    return (
        <DialogContentItem
            simplified
            title={'Error'}
            content={
                <>
                    <Typography variant="body1">{content}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {reason}
                    </Typography>
                </>
            }
            actions={
                <>
                    <span />
                    <ActionButton<typeof Link> variant="contained" color="primary" component={Link} to="/wallets/">
                        {geti18nString('ok')}
                    </ActionButton>
                </>
            }></DialogContentItem>
    )
}

interface WalletDeleteDialogProps {
    onDecline(): void
    onConfirm(): void
    wallet: WalletRecord
}
export function WalletDeleteDialog(props: WalletDeleteDialogProps) {
    const { onConfirm, onDecline, wallet } = props
    const color = useColorProvider()

    const deleteWallet = () =>
        Services.Plugin.invokePlugin('maskbook.wallet', 'removeWallet', wallet.address).then(() => onConfirm())

    return (
        <DialogContentItem
            simplified
            title={'Delete Wallet'}
            content={'Are you sure? If you do not have backup, you will lose ALL YOUR MONEY of it.'}
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={onDecline}>
                        {geti18nString('cancel')}
                    </ActionButton>
                    <ActionButton classes={{ root: color.errorButton }} onClick={deleteWallet}>
                        {geti18nString('ok')}
                    </ActionButton>
                </>
            }></DialogContentItem>
    )
}

interface WalletBackupDialogProps {
    wallet: WalletRecord
    onDecline(): void
}

export function WalletBackupDialog(props: WalletBackupDialogProps) {
    const { onDecline, wallet } = props
    const classes = useWalletImportStyles()

    const content = (
        <Box alignSelf="stretch" width="100%">
            <Typography variant="body1">
                Keep the 12 words below carefully in a safe place. You will need them to restore the private key of this
                wallet.
            </Typography>
            <Box display="flex" flexDirection="column" p={1} className={classes.box} height={152}>
                <Typography variant="body1">{wallet.mnemonic.join(' ')}</Typography>
            </Box>
        </Box>
    )

    return <DialogContentItem onExit={onDecline} title={'Backup Wallet'} content={content}></DialogContentItem>
}
