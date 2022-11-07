import React, { useEffect, useState } from 'react'
import type { TypedMessage } from '@masknet/typed-message'
import { Button, Typography } from '@mui/material'
import { useI18N } from '../../../utils/index.js'
import { paywallUrl } from '../constants.js'
import { renderWithUnlockProtocolMetadata, UnlockProtocolMetadataReader } from '../helpers.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { PluginUnlockProtocolRPC } from '../messages.js'
import { ChainBoundary } from '@masknet/shared'
import { usePluginWrapper } from '@masknet/plugin-infra/dom'
import { NetworkPluginID } from '@masknet/shared-base'

interface UnlockProtocolInPostProps {
    message: TypedMessage
}

export default function UnlockProtocolInPost(props: UnlockProtocolInPostProps) {
    const { t } = useI18N()
    const { message } = props
    const [content, setContent] = useState('')
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [redirectUrl, setRedirectUrl] = useState('')

    useEffect(() => {
        const metadata = UnlockProtocolMetadataReader(props.message.meta)
        if (metadata.ok) {
            if (account) {
                const data: {
                    locks: Record<string, object>
                } = { locks: {} }
                metadata.val.unlockLocks.forEach((locks) => {
                    PluginUnlockProtocolRPC.verifyPurchase(account, locks.unlocklock, locks.chainid).then((res) => {
                        if (!res) return
                        const requestData = {
                            lock: locks.unlocklock,
                            address: account,
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
    }, [chainId, account])
    if (content) {
        const jsx = message
            ? renderWithUnlockProtocolMetadata(props.message.meta, (r) => {
                  return (
                      <Render>
                          <ChainBoundary
                              expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                              expectedChainId={chainId}
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
                              expectedChainId={chainId}
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
