import { memo } from 'react'
import { MiniMaskIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { Button } from '@mui/material'
import { useDashboardI18N } from '../../../../locales'
import { Box } from '@mui/system'

const useStyles = makeStyles()({
    container: {
        borderRadius: 8,
        width: 140,
        height: 215,
        backgroundColor: MaskColorVar.lineLight,
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        width: '100%',
        height: 186,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        flex: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
})

export interface CollectiblePlaceHolderProps {
    onSend(): void
    isHovering: boolean
}

export const CollectiblePlaceholder = memo<CollectiblePlaceHolderProps>(({ onSend, isHovering }) => {
    const { classes } = useStyles()
    const t = useDashboardI18N()

    return (
        <div className={classes.container}>
            <div className={classes.placeholder}>
                <MiniMaskIcon viewBox="0 0 48 48" sx={{ fontSize: 48, opacity: 0.5 }} />
            </div>
            <Box
                className={classes.description}
                sx={{ backgroundColor: isHovering ? MaskColorVar.primaryBackground : '' }}>
                {isHovering ? (
                    <Box py={1} px={3}>
                        <Button
                            size="small"
                            fullWidth
                            onClick={onSend}
                            variant="rounded"
                            style={{ boxShadow: 'none' }}
                            sx={{ fontWeight: 'bolder', height: '28px' }}>
                            {t.send()}
                        </Button>
                    </Box>
                ) : (
                    <div className={classes.description} />
                )}
            </Box>
        </div>
    )
})
