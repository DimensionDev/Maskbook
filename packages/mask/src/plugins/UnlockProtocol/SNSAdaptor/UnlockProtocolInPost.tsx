import type { TypedMessage } from '@masknet/typed-message'
import { Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { paywallUrl } from '../constants'
import { renderWithUnlockProtocolMetadata, UnlockProtocolMetadataReader } from '../helpers'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { PluginUnlockProtocolRPC } from '../messages'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { usePluginWrapper } from '@masknet/plugin-infra/dom'
import { NetworkPluginID } from '@masknet/web3-shared-base'

interface UnlockProtocolInPostProps {
    message: TypedMessage
}

export default function UnlockProtocolInPost(props: UnlockProtocolInPostProps) {
    const { t } = useI18N()
    const { message } = props
    const [content, setContent] = useState('')
    const address = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chain = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [redirectUrl, setRedirectUrl] = useState('')

    useEffect(() => {
        const metadata = UnlockProtocolMetadataReader(props.message.meta)
        if (metadata.ok) {
            if (address) {
                const data: { locks: Record<string, object> } = { locks: {} }
                metadata.val.unlockLocks.forEach((locks) => {
                    PluginUnlockProtocolRPC.verifyPurchase(address, locks.unlocklock, locks.chainid).then((res) => {
                        if (!res) return
                        const requestData = {
                            lock: locks.unlocklock,
                            address,
                            chain: locks.chainid,
                            identifier: metadata.val.iv,
                        }
                        PluginUnlockProtocolRPC.getKey(requestData)
                            .catch((error) => {
                                if (error.code === -1) {
                                    setContent(t('plugin_unlockprotocol_server_error'))
                                }
                            })
                            .then((response) => {
                                setContent(response.message)
                                PluginUnlockProtocolRPC.decryptUnlockData(
                                    metadata.val.iv,
                                    response.post.unlockKey,
                                    metadata.val.post,
                                ).then((content) => {
                                    setContent(content.content)
                                })
                            })
                    })
                    data.locks[locks.unlocklock] = { network: locks.chainid }
                })
                setRedirectUrl(paywallUrl + encodeURI(JSON.stringify(data)))
            }
        }
    }, [chain, address])
    if (content) {
        const jsx = message
            ? renderWithUnlockProtocolMetadata(props.message.meta, (r) => {
                  return (
                      <Render>
                          <ChainBoundary
                              expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                              expectedChainId={chain}
                              noSwitchNetworkTip={false}>
                              <Typography color="textPrimary">{content}</Typography>
                          </ChainBoundary>
                      </Render>
                  )
              })
            : null

        return <>{jsx}</>
    } else if (redirectUrl) {
        const jsx = message
            ? renderWithUnlockProtocolMetadata(props.message.meta, (r) => {
                  return (
                      <Render>
                          <Typography color="textPrimary">"{t('plugin_unlockprotocol_no_access')}"</Typography>
                          <br />
                          <Typography color="textPrimary">"{t('plugin_unlockprotocol_buy_lock_alert')}"</Typography>
                          <br />
                          <Button target="_blank" href={redirectUrl}>
                              {t('plugin_unlockprotocol_buy_lock')}
                          </Button>
                      </Render>
                  )
              })
            : null

        return <>{jsx}</>
    } else {
        const jsx = message
            ? renderWithUnlockProtocolMetadata(props.message.meta, (r) => {
                  return (
                      <Render>
                          <ChainBoundary
                              expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                              expectedChainId={chain}
                              noSwitchNetworkTip={false}>
                              <Typography color="textPrimary">"{t('loading')}"</Typography>
                              <br />
                          </ChainBoundary>
                      </Render>
                  )
              })
            : null

        return <>{jsx}</>
    }
}

function Render(props: React.PropsWithChildren<{}>) {
    usePluginWrapper(true, { width: 300 })
    return <>{props.children}</>
}
