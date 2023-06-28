import { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginPetMessages } from '../messages.js'
import { useI18N } from '../locales/index.js'
import { PluginGameMessages } from '../../Game/messages.js'
import { NFF_TWITTER } from '../constants.js'
import { type ShowMeta, MenuType } from '../types.js'
import { useCurrentVisitingUser } from '../hooks/index.js'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI.js'

type Props = {
    isShow: boolean
    mousePosition: {
        x: number
        y: number
    }
    dragPosition: {
        x: number
        y: number
    }
    showMeta: ShowMeta | undefined
    onClose: () => void
}

const useStyles = makeStyles()(() => ({
    menu: {
        position: 'fixed',
        minWidth: '180px',
        backgroundColor: '#fff',
        opacity: 0,
        zIndex: 9999,
        transition: 'opacity 50ms',
        animation: 'menu-show 0.5s both',
        borderRadius: '12px',
        pointerEvents: 'none',
        boxShadow: '0 0 12px rgba(0,0,0,.1)',
        '&>div': {
            position: 'relative',
            display: 'block',
            padding: '20px',
            fontSize: '14px',
            transition: 'backgroundColor 100ms',
            cursor: 'pointer',

            '&>span': {
                pointerEvents: 'none',
            },
            '&:hover': {
                backgroundColor: '#f1f1f1',
            },
            '&:first-child': {
                borderRadius: '12px 12px 0 0',
            },
            '&:last-child': {
                borderRadius: '0 0 12px 12px',
            },
        },
    },
    show: {
        opacity: '1 !important',
        pointerEvents: 'auto',
    },
}))

function RightMenu(props: Props) {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const refMenuDom = useRef<HTMLDivElement>(null)
    const visitor = useCurrentVisitingUser(0)
    const whoAmI = useLastRecognizedIdentity()

    const [isLeft, setIsLeft] = useState(false)
    const [isTop, setIsTop] = useState(false)

    const { openDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)
    const { setDialog: openGameDialog } = useRemoteControlledDialog(PluginGameMessages.events.gameDialogUpdated)

    useEffect(() => {
        if (props.isShow) {
            setIsLeft(props.mousePosition.x > window.innerWidth / 2)
            setIsTop(props.mousePosition.y > window.innerHeight / 2)
            document.body.addEventListener('click', props.onClose, false)
            document.body.addEventListener('scroll', props.onClose, false)
        }

        return () => {
            document.body.removeEventListener('click', props.onClose, false)
            document.body.removeEventListener('scroll', props.onClose, false)
        }
    }, [props.isShow, props.onClose, props.dragPosition.x, props.dragPosition.y])

    function onClickMenu(type: MenuType) {
        switch (type) {
            case MenuType.Setting:
                openDialog()
                break
            case MenuType.Game:
                openGameDialog({
                    open: true,
                    tokenProps: {
                        tokenId: props.showMeta?.tokenId,
                        contract: props.showMeta?.contract,
                        chainId: props.showMeta?.chainId,
                    },
                })
                break
            case MenuType.About:
                window.open(NFF_TWITTER)
                break
        }
        props.onClose()
    }

    return (
        <div
            ref={refMenuDom}
            onMouseDown={stopPop}
            onMouseUp={stopPop}
            className={cx(classes.menu, {
                [classes.show]: props.isShow,
            })}
            style={{
                left: props.mousePosition.x,
                top: props.mousePosition.y,
                transform: `translate(${isLeft ? '-100%' : 0}, ${isTop ? '-100%' : 0})`,
            }}>
            <div onClick={() => onClickMenu(MenuType.Setting)}>
                <Typography>{t.pets_dialog_menu_change()}</Typography>
            </div>
            <div onClick={() => onClickMenu(MenuType.About)}>
                <Typography>{t.pets_dialog_menu_about()}</Typography>
            </div>
        </div>
    )
}

export default RightMenu

function stopPop(e: React.MouseEvent) {
    e.stopPropagation()
    e.nativeEvent.stopPropagation()
}
