import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'

const useStyles = makeStyles()({
    root: {
        padding: '3vw',
        minHeight: '100vh',
        backgroundColor: MaskColorVar.bottom,
    },
    container: {
        backgroundColor: MaskColorVar.background,
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export interface CreateMaskWalletFrameProps extends React.PropsWithChildren<{}> {}

export const CreateMaskWalletFrame = memo<CreateMaskWalletFrameProps>((props) => {
    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            <div className={classes.container}>{props.children}</div>
        </div>
    )
})
