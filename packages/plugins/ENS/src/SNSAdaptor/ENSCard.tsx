import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { useAsyncRetry } from 'react-use'
import { Card, CardHeader, Typography, CardContent } from '@mui/material'
import { useI18N } from '../locales'
const { hash } = require('eth-ens-namehash')
import { useAccount } from '@masknet/web3-shared-evm'
import { useENSContract } from './hook/useENSContract'
import ENSDetail from './ENSDetail'
import { getEthereumName } from './hook/getEthereumName'

const useStyles = makeStyles()((theme) => ({
    root: {
        '--contentHeight': '200px',
        '--tabHeight': '35px',

        width: '100%',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    content: {
        width: '100%',
        minHeight: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 !important',
    },
    body: {
        flex: 1,
        maxHeight: 'calc(var(--contentHeight) - var(--tabHeight))',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tabs: {
        height: 'var(--tabHeight)',
        width: '100%',
        minHeight: 'unset',
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
    },
    tab: {
        height: 'var(--tabHeight)',
        minHeight: 'unset',
        minWidth: 'unset',
    },
    subtitle: {
        fontSize: 12,
        marginRight: theme.spacing(0.5),
    },
}))
interface identity {
    nickname?: string
    userId?: string
    bio?: string
}
interface ENSCardProps {
    url?: string
    identity?: identity
}

const ENSCard: React.FC<ENSCardProps> = ({ url, identity }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const contract = useENSContract()
    const account = useAccount()

    const { value: ENS_Info } = useAsyncRetry(async () => {
        const ENS_name =
            url?.split('/')?.find((str) => str?.includes('.eth')) ??
            getEthereumName?.(identity?.userId ?? '', identity?.nickname ?? '', identity?.bio ?? '')
        const nameHash = hash(ENS_name)
        const owner = await contract?.methods?.owner(nameHash)?.call({ from: account })
        const resolver = await contract?.methods?.resolver(nameHash)?.call({ from: account })
        const ttl = await contract?.methods?.ttl(nameHash)?.call({ from: account })
        return {
            owner,
            resolver,
            ttl,
            ENS_name,
        }
    }, [contract, account])
    console.log({ url })

    return (
        <>
            <Card className={classes.root} elevation={0}>
                <CardHeader
                    title={
                        <Box
                            display="flex"
                            alignItems="center"
                            borderBottom="1px solid black"
                            justifyContent="space-between">
                            <Typography sx={{ marginRight: 1 }}>
                                <Typography component="span" color="textSecondary" sx={{ marginRight: 0.5 }}>
                                    {t.Ethereum_Name_Service()}
                                </Typography>
                                <Typography variant="h6" component="span">
                                    #{ENS_Info?.ENS_name}
                                </Typography>
                            </Typography>
                        </Box>
                    }
                />
                <CardContent className={classes.content}>
                    <ENSDetail ENS_Info={ENS_Info} />
                </CardContent>
            </Card>
        </>
    )
}

export default ENSCard
