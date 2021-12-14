import { memo } from 'react'
import { MiniMaskIcon } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { WalletIcon } from '@masknet/shared'
import { Box } from '@mui/material'
import { useNetworkDescriptor } from '@masknet/plugin-infra'

const useStyles = makeStyles()({
    container: {
        position: 'relative',
        borderRadius: 8,
        width: 140,
        height: 186,
        backgroundColor: MaskColorVar.lineLight,
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        flex: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    chainIcon: {
        position: 'absolute',
        right: 8,
        top: 8,
        height: 20,
        width: 20,
    },
})

export interface CollectiblePlaceHolderProps {
    chainId?: number
}

export const CollectiblePlaceholder = memo<CollectiblePlaceHolderProps>(({ chainId }) => {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    const networkDescriptor = useNetworkDescriptor(chainId)

    return (
        <div className={classes.container}>
            <Box className={classes.chainIcon}>
                <WalletIcon networkIcon={networkDescriptor?.icon} size={20} />
            </Box>
            <div className={classes.placeholder}>
                <MiniMaskIcon viewBox="0 0 48 48" sx={{ fontSize: 48, opacity: 0.5 }} />
            </div>
        </div>
    )
})
