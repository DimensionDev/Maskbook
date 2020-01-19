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
    AppBar,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import ArrowBack from '@material-ui/icons/ArrowBack'
import ActionButton from '../DashboardComponents/ActionButton'
import { DialogContentItem } from './DialogBase'
import { RedPacket } from '../DashboardComponents/RedPacket'
import WalletLine from '../DashboardComponents/WalletLine'
import Services from '../../service'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import { RedPacketRecord } from '../../../database/Plugins/Wallet/types'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { ERC20TokenPredefinedData } from '../../../plugins/Wallet/erc20'
import { VirtualizedList } from './WalletAddTokenDialogContent'

const mainnet: ERC20TokenPredefinedData = require('../../../plugins/Wallet/mainnet_erc20.json')
const rinkeby: ERC20TokenPredefinedData = require('../../../plugins/Wallet/rinkeby_erc20.json')

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
                        <ActionButton variant="outlined" color="primary" className={classes.provider} width={240}>
                            Open twitter.com
                        </ActionButton>
                    </div>
                </>
            }></DialogContentItem>
    )
}

interface WalletAddTokenDialogProps {
    onConfirm(token: string): void
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
    const [tabID, setTabID] = React.useState<0 | 1>(1)

    const [address, setTokenAddress] = React.useState('')
    const [decimal, setDecimal] = React.useState('')
    const [tokenName, setTokenName] = React.useState('')
    const [symbol, setSymbol] = React.useState('')

    return (
        <DialogContentItem
            onExit={onDecline}
            title={'Add Token'}
            tabs={
                <Paper square>
                    <Tabs
                        value={tabID}
                        onChange={(e, n) => {
                            setTabID(n as any)
                        }}
                        aria-label="simple tabs example">
                        <Tab label="Well-known token" />
                        <Tab label="Add your own token" />
                    </Tabs>
                </Paper>
            }
            content={
                <>
                    {tabID === 0 ? (
                        <VirtualizedList />
                    ) : (
                        <>
                            <TextField
                                className={classes.textfield}
                                label="Contract Address"
                                value={address}
                                onChange={e => setTokenAddress(e.target.value)}></TextField>
                            <TextField
                                className={classes.textfield}
                                label="Decimal"
                                value={decimal}
                                type="number"
                                inputProps={{ min: 0 }}
                                onChange={e => setDecimal(e.target.value)}></TextField>
                            <TextField
                                className={classes.textfield}
                                label="Name"
                                value={tokenName}
                                onChange={e => setTokenName(e.target.value)}></TextField>
                            <TextField
                                className={classes.textfield}
                                label="Symbol"
                                value={symbol}
                                onChange={e => setSymbol(e.target.value)}></TextField>
                        </>
                    )}
                </>
            }
            actions={
                <ActionButton variant="contained" color="primary" onClick={() => onConfirm(address)}>
                    Add Token
                </ActionButton>
            }></DialogContentItem>
    )
}

interface WalletRedPacketHistoryDialogProps {
    onClick?(packet: RedPacketRecord): void
    onDecline(): void
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
    const { onClick, onDecline } = props
    const [tabState, setTabState] = React.useState(0)
    const [redPacketRecords, setRedPacketRecords] = React.useState<RedPacketRecord[]>([])

    React.useEffect(() => {
        const updateHandler = () =>
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets', tabState === 1).then(
                setRedPacketRecords,
            )

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
                    {redPacketRecords.map(record => (
                        <WalletLine
                            key={record.id}
                            line1={record.send_message}
                            line2={`${record.block_creation_time} hr ago from ${record.sender_name}`}
                            onClick={() => onClick?.(record)}
                            invert
                            action={
                                <Typography variant="h6">
                                    {record.send_total.toLocaleString()} {'USDT' || record.token_type}
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
    return (
        <DialogContentItem
            icon={<ArrowBack />}
            onExit={onDecline}
            title="Red Packet Detail"
            content={
                <>
                    <RedPacket redPacket={redPacket} />
                    <WalletLine
                        onClick={() =>
                            redPacket._found_in_url_ &&
                            window.open(redPacket._found_in_url_, '_blank', 'noopener noreferrer')
                        }
                        line1="Source"
                        line2={
                            <Typography className={classes.link} color="primary">
                                {redPacket._found_in_url_ || 'Unknown'}
                            </Typography>
                        }
                    />
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
                    <Typography className={classes.openBy} variant="subtitle1">
                        Opened By
                    </Typography>
                    <Divider />
                    <WalletLine
                        line1="PPPC"
                        line2="0x1191467182361282137761"
                        invert
                        action={<Typography variant="h6">5.28714</Typography>}
                    />
                    <WalletLine
                        line1="CCCP"
                        line2="0x1191467182361282137744"
                        invert
                        action={<Typography variant="h6">5.28714</Typography>}
                    />
                    <Box p={1} display="flex" justifyContent="center">
                        <Typography variant="caption" color="textSecondary">
                            {redPacket.block_creation_time?.toLocaleString()} hr ago created, 2 hr ago received.
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
