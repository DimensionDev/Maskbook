import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import PoapPanel from './PoapPanel'
import PartsPanel from './PartsPanel'
import FtgPanel from './FtgPanel'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'

const useStyles = makeStyles()((theme) => ({
    box: {
        display: 'flex',
        flexDirection: 'column',
    },
    row: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'baseline',
    },
}))

interface AssetsPanelProps {}

export default function AssetsPanel(props: AssetsPanelProps) {
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

    return (
        <Box className={classes.box}>
            <Box className={classes.row}>
                <Typography textAlign="left" variant="h5" color="text.primary" gutterBottom>
                    {t('plugin_find_truman_dialog_assets_ftg')}
                </Typography>
                <Typography textAlign="left" variant="body2" color="text.secondary" ml={1} gutterBottom>
                    {t('plugin_find_truman_dialog_ethereum_mainnet')}
                </Typography>
            </Box>
            <FtgPanel />

            <Box className={classes.row} mt={2}>
                <Typography textAlign="left" variant="h5" color="text.primary" gutterBottom>
                    {t('plugin_find_truman_dialog_assets_POAP')}
                </Typography>
                <Typography textAlign="left" variant="body2" color="text.secondary" ml={1} gutterBottom>
                    {t('plugin_find_truman_dialog_ethereum_polygon')}
                </Typography>
            </Box>
            <PoapPanel />

            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2} mb={2}>
                <Box className={classes.row}>
                    <Typography textAlign="left" variant="h5" color="text.primary">
                        {t('plugin_find_truman_dialog_assets_parts')}
                    </Typography>
                    <Typography textAlign="left" variant="body2" color="text.secondary" ml={1} gutterBottom>
                        {t('plugin_find_truman_dialog_ethereum_polygon')}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    component="a"
                    href="https://findtruman.io/#/assets"
                    target="_blank">
                    {t('plugin_find_truman_dialog_fusion_fusion')}
                </Button>
            </Box>
            <PartsPanel />
        </Box>
    )
}
