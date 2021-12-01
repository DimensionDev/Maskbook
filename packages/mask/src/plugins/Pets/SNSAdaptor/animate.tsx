import { useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { getAssetAsBlobURL } from '../../../utils'
import Drag from './drag'
import AnimatedMessage from './animatedMsg'
import Tip from './tooltip'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'

import { ChainId } from '@masknet/web3-shared-evm'
import { useAccount, useChainId, useCollectibles } from '@masknet/web3-shared-evm'
import { useValueRef } from '@masknet/shared'
import { currentNonFungibleAssetDataProviderSettings } from '../../Wallet/settings'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
    img: {
        zIndex: 999,
        width: '100%',
        height: '100%',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },
    close: {
        width: 15,
        height: 15,
        cursor: 'pointer',
        backgroundSize: 'contain',
        position: 'absolute',
        top: 0,
        right: -10,
    },
}))

const AnimatePic = () => {
    const classes = useStylesExtends(useStyles(), {})
    const Background = getAssetAsBlobURL(new URL('../assets/loot.gif', import.meta.url))
    const Close = getAssetAsBlobURL(new URL('../assets/close.png', import.meta.url))

    const [show, setShow] = useState(false)
    const [infoShow, setInfoShow] = useState(false)

    const identity = useCurrentVisitingIdentity()
    useEffect(() => {
        const userId = identity.identifier.userId
        const maskId = 'realMaskNetwork'
        setShow(userId === maskId)
    }, [identity])

    const handleClose = () => setShow(false)
    const handleMouseEnter = () => setInfoShow(true)
    const handleMouseLeave = () => setInfoShow(false)

    const [NFT, setNFT] = useState('')
    const account = useAccount()
    const chainId = useChainId()
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const {
        value = {
            collectibles: [],
            hasNextPage: false,
        },
        loading,
        retry,
        error,
    } = useCollectibles(account, ChainId.Mainnet, provider, 0, 50)
    const { collectibles, hasNextPage } = value
    console.log('collectibles', collectibles, hasNextPage)

    useEffect(() => {
        collectibles.forEach((item: any, idx: number) => {
            if (idx === 0) {
                setNFT(item.info.image)
            }
        })
    }, [JSON.stringify(collectibles)])

    return (
        <div className={classes.root} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {show ? (
                <Drag>
                    <AnimatedMessage />
                    <div className={classes.img} style={{ backgroundImage: `url(${NFT})` }} />
                    {infoShow ? (
                        <>
                            <Tip />
                            <div
                                className={classes.close}
                                onClick={handleClose}
                                style={{ backgroundImage: `url(${Close})` }}
                            />
                        </>
                    ) : null}
                </Drag>
            ) : null}
        </div>
    )
}

export default AnimatePic
