import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
// import { CSSTransition } from 'react-transition-group'
import { useI18N } from '../../../utils'
import { PluginPetRPC } from '../messages'
import { useAccount } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({
    txt: {
        position: 'absolute',
        top: -40,
        fontSize: '12px',
        color: '#737373',
        fontWeight: 600,
        width: '150%',
        fontFamily: 'TwitterChirp',
    },
    enter: {
        left: 150,
        opacity: 0,
    },
    enterActive: {
        left: 0,
        opacity: 1,
        transition: 'all 1500ms ease-in',
    },
    enterDone: {
        left: 0,
        opacity: 1,
    },
    exitActive: {
        left: 150,
        opacity: 0,
        transition: 'all 1500ms ease-out',
    },
}))

const AnimatedMessage = () => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [start, setStart] = useState(false)
    const txts = [
        t('plugin_pets_loot_des_0'),
        t('plugin_pets_loot_des_1'),
        t('plugin_pets_loot_des_2'),
        t('plugin_pets_loot_des_3'),
        t('plugin_pets_loot_des_4'),
        t('plugin_pets_loot_des_5'),
        t('plugin_pets_loot_des_6'),
        t('plugin_pets_loot_des_7'),
        t('plugin_pets_loot_des_8'),
        t('plugin_pets_loot_des_9'),
        t('plugin_pets_loot_des_10'),
        t('plugin_pets_loot_des_11'),
        t('plugin_pets_loot_des_12'),
        t('plugin_pets_loot_des_13'),
        t('plugin_pets_loot_des_14'),
    ]

    const [show, setShow] = useState(txts[0])

    // React.useEffect(() => {
    //     let count = 0
    //     const timer = setInterval(() => {
    //         setStart(count % 9 < 5)
    //         count = count + 1
    //     }, 1000 * 1)
    //     return () => {
    //         clearInterval(timer)
    //     }
    // }, [])

    // useEffect(() => {
    //     if (start) return
    //     const timer = setTimeout(() => {
    //         const idx = Math.round(Math.random() * (txts.length - 1))
    //         setShow(txts[idx])
    //     }, 1500)
    //     return () => {
    //         clearInterval(timer)
    //     }
    // }, [start])

    // return (
    //     <CSSTransition
    //         in={start}
    //         timeout={{
    //             appear: 1000,
    //             enter: 1500,
    //             exit: 1500,
    //         }}
    //         classNames={{
    //             enter: classes.enter,
    //             enterActive: classes.enterActive,
    //             enterDone: classes.enterDone,
    //             exit: classes.enterDone,
    //             exitActive: classes.exitActive,
    //             exitDone: classes.enter,
    //         }}>
    //         <div className={classes.txt}>{show}</div>
    //     </CSSTransition>
    // )

    const account = useAccount()

    const getHandle = async () => {
        console.log('PluginPetRPC', PluginPetRPC)
        const res = await PluginPetRPC.getEssay('leeleeECHO_', account)
        console.log(res.word)
        setShow(res.word)
    }

    useEffect(() => {
        setInterval(() => {
            getHandle()
        }, 1000 * 5)
    }, [])

    return (
        <div>
            <div className={classes.txt}>{show}</div>
        </div>
    )
}

export default AnimatedMessage
