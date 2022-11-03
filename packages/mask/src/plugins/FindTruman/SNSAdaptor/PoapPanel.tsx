import { makeStyles } from '@masknet/theme'
import { useAsync } from 'react-use'
import { fetchUserPoap } from '../Worker/apis/index.js'
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { useContext } from 'react'
import { FindTrumanContext } from '../context.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { Image } from '@masknet/shared'

const useStyles = makeStyles()((theme, props) => ({
    skeleton: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    poap: {
        width: '120px',
        height: '120px',
        borderRadius: '8px',
    },
    poapCover: {
        width: '150px',
        height: '150px',
        borderRadius: '8px',
        border: 'none',
        filter: 'grayscale(100%)',
        background: 'rgba(255, 255, 255, 0.15)',
        transition: 'all .3s',
        '&:hover': {
            transform: 'scale(1.05)',
        },
    },
}))

interface PoapPanelProps {}

export default function PoapPanel(props: PoapPanelProps) {
    const { classes } = useStyles()
    const { t, const: consts } = useContext(FindTrumanContext)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { value: poaps, loading } = useAsync(async () => {
        return account ? fetchUserPoap(account) : undefined
    }, [account])

    return (
        <div>
            {loading ? (
                <Box className={classes.skeleton}>
                    <Skeleton variant="rectangular" animation="wave" width={120} height={120} />
                    <Skeleton animation="wave" width={120} />
                    <Skeleton animation="wave" width={36} />
                </Box>
            ) : poaps && poaps.length > 0 ? (
                <Grid container spacing={2} justifyContent="center">
                    {poaps.map((poap) => (
                        <Grid key={poap.id} item xs={3}>
                            <Image className={classes.poap} src={poap.img} />
                            <Typography variant="body2" textAlign="center">
                                {poap.name}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography textAlign="center" variant="body1" color="text.secondary" gutterBottom>
                        {t('plugin_find_truman_dialog_no_poap_tip')}
                    </Typography>
                    <Image src={consts?.poapImg} className={classes.poapCover} />
                    <Button
                        component="a"
                        href={consts?.getPoapUrl}
                        target="_blank"
                        sx={{ mt: 1 }}
                        color="primary"
                        variant="text">
                        {t('plugin_find_truman_dialog_get_poap_tip')}
                    </Button>
                </Box>
            )}
        </div>
    )
}
