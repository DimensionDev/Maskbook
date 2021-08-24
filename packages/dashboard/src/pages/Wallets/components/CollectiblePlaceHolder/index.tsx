import { memo } from 'react'
import { MiniMaskIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'

const useStyles = makeStyles()({
    container: {
        borderRadius: 8,
        width: 140,
        height: 215,
        backgroundColor: MaskColorVar.lightBackground,
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
        backgroundColor: MaskColorVar.infoBackground,
    },
})

export const CollectiblePlaceholder = memo(() => {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.placeholder}>
                <MiniMaskIcon viewBox="0 0 48 48" sx={{ fontSize: 48, opacity: 0.5 }} />
            </div>
            <div className={classes.description} />
        </div>
    )
})
