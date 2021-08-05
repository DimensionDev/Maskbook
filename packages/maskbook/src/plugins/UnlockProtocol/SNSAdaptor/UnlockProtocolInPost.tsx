import type { TypedMessage } from '../../../protocols/typed-message'
import { Button } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { paywallUrl } from '../constants'
import { renderWithUnlockProtocolMetadata, UnlockProtocolMetadataReader } from '../helpers'
import { useAccount, useChainId } from '@masknet/web3-shared'
import { PuginUnlockProtocolRPC } from '../messages'

interface UnlockProtocolInPostProps {
    message: TypedMessage
}

function UnlockDecipher(props: { iv: string }) {
    useEffect(() => {})
    return <> {props.iv} </>
}

export default function UnlockProtocolInPost(props: UnlockProtocolInPostProps) {
    const { t } = useI18N()
    const { message } = props
    const [cont, setCont] = useState('')
    const [address, setAddress] = useState(useAccount())
    const [chain, setChain] = useState(useChainId())
    const [redirurl, setRedirurl] = useState('')

    useEffect(() => {
        const metadata = UnlockProtocolMetadataReader(props.message.meta)
        if (metadata.ok) {
            if (!!address) {
                const data: { locks: Record<string, any> } = { locks: {} }
                PuginUnlockProtocolRPC.getPurchasedLocks(address, chain).then((res) => {
                    res.keyPurchases.forEach((e: { lock: string }) => {
                        metadata.val.unlockLocks.forEach((locks) => {
                            if (e.lock === locks.unlocklock) {
                                const requestdata = {
                                    lock: e.lock,
                                    address: address,
                                    chain: locks.chainid,
                                    identifier: metadata.val.iv,
                                }
                                PuginUnlockProtocolRPC.getKey(requestdata).then((response) => {
                                    PuginUnlockProtocolRPC.decryptUnlockData(
                                        metadata.val.iv,
                                        response.post.unlockKey,
                                        metadata.val.post,
                                    ).then((content) => {
                                        setCont(content.content)
                                    })
                                })
                            }
                            data.locks[locks.unlocklock] = { network: locks.chainid }
                        })
                    })
                    setRedirurl(paywallUrl + encodeURI(JSON.stringify(data)))
                })
            } else {
                setCont('please connect wallet!!!')
            }
        }
    }, [props.message.meta])
    if (!!cont) {
        const jsx = message
            ? renderWithUnlockProtocolMetadata(props.message.meta, (r) => {
                  return (
                      <>
                          <MaskbookPluginWrapper width={300} pluginName="Unlock Protocol">
                              {cont}
                          </MaskbookPluginWrapper>
                      </>
                  )
              })
            : null

        return <>{jsx}</>
    } else {
        const jsx = message
            ? renderWithUnlockProtocolMetadata(props.message.meta, (r) => {
                  return (
                      <MaskbookPluginWrapper width={300} pluginName="Unlock Protocol">
                          <>
                              <text>"You don't have access to this content"</text>
                              <br />
                              <Button target="_blank" href={redirurl}>
                                  Buy Lock
                              </Button>
                          </>
                      </MaskbookPluginWrapper>
                  )
              })
            : null

        return <>{jsx}</>
    }
}
