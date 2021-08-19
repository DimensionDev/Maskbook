import { memo } from 'react'
import { makeStyles } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        padding: '3vw',
        backgroundColor: MaskColorVar.lightBackground,
    },
    container: {
        contain: 'strict',
        backgroundColor: MaskColorVar.white,
        borderRadius: 24,
        width: '100%',
        height: '100%',
        minHeight: 832,
    },
}))

export interface CreateMaskWalletFrameProps extends React.PropsWithChildren<{}> {}

export const CreateMaskWalletFrame = memo<CreateMaskWalletFrameProps>((props) => {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <div className={classes.container}>{props.children}</div>
        </div>
    )
})
