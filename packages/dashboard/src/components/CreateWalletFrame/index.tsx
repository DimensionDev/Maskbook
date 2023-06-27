import { memo, type PropsWithChildren } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'

const useStyles = makeStyles()({
    root: {
        minHeight: '100vh',
        backgroundColor: MaskColorVar.bottom,
        display: 'flex',
        flexDirection: 'column',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
})

export interface CreateMaskWalletFrameProps extends PropsWithChildren<{}> {}

export const CreateMaskWalletFrame = memo<CreateMaskWalletFrameProps>((props) => {
    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            <div className={classes.container}>{props.children}</div>
        </div>
    )
})
