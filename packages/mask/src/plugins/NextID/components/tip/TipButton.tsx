import { FC, HTMLProps, MouseEventHandler, useCallback, useEffect, useState } from 'react'
import classnames from 'classnames'
import { usePostInfo } from '@masknet/plugin-infra'
import { Currency } from '@masknet/icons'
import { PluginNextIdMessages } from '../../messages'

interface Props extends HTMLProps<HTMLDivElement> {}

export const TipButton: FC<Props> = ({ className, ...rest }) => {
    const postInfo = usePostInfo()
    const [addresses, setAddresses] = useState<string[]>(() => {
        const list = ['0x790116d0685eB197B886DAcAD9C247f785987A4a']
        const snsId = postInfo?.snsID.getCurrentValue()
        if (snsId) list.push('snsId' + snsId)
        return list
    })
    const [snsID, setSnsID] = useState(postInfo?.snsID.getCurrentValue())

    useEffect(() => {
        postInfo?.snsID.subscribe(() => {
            const snsId = postInfo?.snsID.getCurrentValue() || ''
            setSnsID('snsid' + snsId)
            setAddresses((list) => (list.includes(snsId) ? list : [...list, snsId]))
        })
    }, [postInfo?.snsID])

    const sendTip: MouseEventHandler<HTMLDivElement> = useCallback(
        (evt) => {
            evt.stopPropagation()
            evt.preventDefault()
            if (!snsID) return
            PluginNextIdMessages.tipTask.sendToLocal({
                snsID,
                addresses,
            })
        },
        [addresses, snsID],
    )
    return (
        <div className={classnames(className)} {...rest} role="button" onClick={sendTip}>
            <Currency htmlColor="#8899a6" viewBox="0 0 24 24" />
        </div>
    )
}
