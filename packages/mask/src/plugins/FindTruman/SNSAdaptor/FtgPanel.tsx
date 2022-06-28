import { formatTokenId } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Link, Typography } from '@mui/material'
import { useAsync } from 'react-use'
import type { FtgInfo, Part } from '../types'
import { fetchExchangeStatus } from '../Worker/apis'
import FusionFtg from './FusionFtg'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'
import { getPartName } from './PartsPanel'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useERC721TokenContract } from '@masknet/plugin-infra/web3-evm'

const useStyles = makeStyles()((theme) => ({
    ftgCover: {
        width: '150px',
        height: '150px',
        borderRadius: '8px',
        border: 'none',
        background: 'rgba(255, 255, 255, 0.15)',
        transition: 'all .3s',
        '&:hover': {
            transform: 'scale(1.05)',
        },
    },
    ftgRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        columnGap: theme.spacing(4),
        ':first-child': {
            marginTop: theme.spacing(2),
        },
        ':not(:last-child)': {
            marginBottom: theme.spacing(4),
            paddingBottom: theme.spacing(4),
            borderBottom: '1px solid rgba(255, 255, 255, .15)',
        },
    },
    ftgInfoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: theme.spacing(2),
        ':not(:last-child)': {
            marginBottom: theme.spacing(1),
        },
    },
}))

interface FtgPanelProps {}

export default function FtgPanel(props: FtgPanelProps) {
    const { classes } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const ftgContract = useERC721TokenContract(chainId, consts?.ftgAddress)

    const { value: ftgs } = useAsync(async () => {
        try {
            if (account && ftgContract) {
                const ftgs: FtgInfo[] = []
                const balance = await ftgContract.methods.balanceOf(account).call()
                for (let i = 0; i < (balance || 0); i += 1) {
                    const tokenId = await ftgContract.methods.tokenOfOwnerByIndex(account, i).call()
                    const uri = await ftgContract.methods.tokenURI(tokenId).call()
                    if (uri) {
                        const res = await fetch(uri)
                        const nft = await res.json()
                        const tokenId = uri.split('/').at(-1)
                        ftgs.push({ ...nft, tokenId })
                    }
                }
                return ftgs
            }
        } catch (error) {}
        return []
    }, [account, ftgContract])

    const { value: fusion } = useAsync(async () => {
        return account ? fetchExchangeStatus(account) : undefined
    }, [account])

    return (
        <div>
            {(ftgs && ftgs.length > 0) || fusion ? (
                <>
                    {ftgs?.map((ftg) => (
                        <FtgItem key={ftg.tokenId} ftg={ftg} />
                    ))}
                    {fusion?.parts && <FusionItem parts={fusion.parts} />}
                </>
            ) : (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography textAlign="center" variant="body1" color="text.secondary" gutterBottom>
                        {t('plugin_find_truman_dialog_buy_ftg_tip')}
                    </Typography>
                    <img src={consts?.ftgImg} className={classes.ftgCover} />
                    <Button
                        component="a"
                        href="https://findtruman.io/#/buy"
                        target="_blank"
                        sx={{ mt: 1, width: '150px' }}
                        color="primary">
                        {t('plugin_find_truman_dialog_buy_ftg')}
                    </Button>
                </Box>
            )}
        </div>
    )
}

function FtgInfoRow(props: { title: string; value: string | React.ReactNode }) {
    const { title, value } = props
    const { classes } = useStyles()
    return (
        <Box className={classes.ftgInfoRow}>
            <Typography fontWeight="bold" variant="body1" color="text.primary">
                {title}
            </Typography>
            {typeof value === 'string' ? (
                <Typography variant="body1" color="text.secondary">
                    {value}
                </Typography>
            ) : (
                value
            )}
        </Box>
    )
}

function FtgItem(props: { ftg: FtgInfo }) {
    const { ftg } = props
    const { classes } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)

    return (
        <Box className={classes.ftgRow}>
            <img className={classes.ftgCover} src={ftg.image} />
            <Box sx={{ width: '250px' }}>
                <Typography textAlign="center" variant="h6" color="text.primary" gutterBottom>
                    {ftg.name}
                </Typography>
                <FtgInfoRow
                    title={t('plugin_find_truman_dialog_ftg_info_token')}
                    value={formatTokenId(ftg.tokenId, 2)}
                />
                <FtgInfoRow title={t('plugin_find_truman_dialog_ftg_info_blockchain')} value="Ethereum" />
                <FtgInfoRow title={t('plugin_find_truman_dialog_ftg_info_standard')} value="ERC721 Enumerable" />
                {consts && (
                    <FtgInfoRow
                        title={t('plugin_find_truman_dialog_ftg_info_contract')}
                        value={
                            <Box display="flex">
                                <Typography variant="body1" color="text.secondary" mr={1}>
                                    {consts.ftgAddress.slice(0, 7)}...{consts.ftgAddress.slice(38, 42)}
                                </Typography>
                                <Link
                                    href={`https://etherscan.io/address/${consts.ftgAddress}`}
                                    variant="body1"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    view
                                </Link>
                            </Box>
                        }
                    />
                )}
            </Box>
        </Box>
    )
}

function FusionItem(props: { parts: Part[] }) {
    const { parts } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)
    return (
        <Box className={classes.ftgRow}>
            <FusionFtg parts={parts} />
            <Box sx={{ width: '250px' }}>
                <Typography textAlign="center" variant="h6" color="text.primary" gutterBottom>
                    FindTruman Genesis
                </Typography>
                <FtgInfoRow
                    title={t('plugin_find_truman_dialog_ftg_info_token')}
                    value={t('plugin_find_truman_dialog_ftg_no_minted')}
                />
                {parts.map((part) => (
                    <FtgInfoRow key={part.type} title={getPartName(t, part.type)} value={part.name} />
                ))}
            </Box>
        </Box>
    )
}
