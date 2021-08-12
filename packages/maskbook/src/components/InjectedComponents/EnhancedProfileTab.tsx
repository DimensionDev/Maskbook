import { useStylesExtends } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import Color from 'color'
import { useCallback, useEffect, useState } from 'react'

import { MaskMessage } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    tab: {
        '&:hover': {
            backgroundColor: new Color(getMaskColor(theme).blue).alpha(0.1).toString(),
            cursor: 'pointer',
        },
    },
    button: {
        display: 'flex',
        minWidth: 56,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: theme.spacing(1),
        fontWeight: 700,
        color: getMaskColor(theme).blue,
    },
    hot: {
        color: 'black',
    },
    line: {
        dispaly: 'inline-flex',
        borderRadius: 99999,
        position: 'absolute',
        bottom: 0,
        minWidth: 56,
        alignSelf: 'center',
        height: 4,
        backgroundColor: getMaskColor(theme).blue,
    },
}))
export interface EnhancedProfileTabProps extends withClasses<'tab' | 'button' | 'hot' | 'line'> {
    clear(): void
    reset(): void
}

export function EnhancedProfileTab(props: EnhancedProfileTabProps) {
    const { reset, clear } = props
    const { classes } = useStyles()
    const styles = useStylesExtends(classes, props)
    const [active, setActive] = useState(false)

    const onClose = () => {
        setActive(false)
        MaskMessage.events.profileNFTsPageUpdated.sendToLocal({ show: false })
        reset()
    }
    const onOpen = () => {
        MaskMessage.events.profileNFTsPageUpdated.sendToLocal({ show: true })
        setActive(true)
    }

    useEffect(() => {
        return MaskMessage.events.profileNFTsTabUpdated.on(onClose)
    }, [])

    const onClick = useCallback(() => {
        onOpen()
        clear()
    }, [clear, onOpen])

    return (
        <div key="nfts" className={styles.tab}>
            <div className={classNames(styles.button, active ? styles.hot : '')} onClick={onClick}>
                NFTs
                {active ? <div className={styles.line} /> : null}
            </div>
        </div>
    )
}
