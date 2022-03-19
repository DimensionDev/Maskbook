import { Currency } from '@masknet/icons'
import { useAccount } from '@masknet/plugin-infra'
import classnames from 'classnames'
import { FC, HTMLProps, MouseEventHandler, useCallback } from 'react'
import { PluginNextIdMessages } from '../../messages'

interface Props extends HTMLProps<HTMLDivElement> {}

export const TipButton: FC<Props> = ({ className, ...rest }) => {
    // So far it is not possible to fetch wallets of user
    const account = useAccount()

    const sendTip: MouseEventHandler<HTMLDivElement> = useCallback(
        (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            PluginNextIdMessages.tipTask.sendToLocal({
                addresses: [account],
            })
        },
        [account],
    )
    return (
        <div className={classnames(className)} {...rest} role="button" onClick={sendTip}>
            <Currency htmlColor="#8899a6" viewBox="0 0 24 24" />
        </div>
    )
}
