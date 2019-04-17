import * as React from 'react'
import Divider from '@material-ui/core/Divider/Divider'
import Typography from '@material-ui/core/Typography/Typography'

interface Props {
    title: React.ReactNode
    children?: any
}
export const AdditionalContent = (props: Props) => {
    return (
        <>
            <Divider style={{ marginBottom: 6, marginBlock: 6 }} />
            <Typography variant="caption" style={{ display: 'flex' }}>
                <img
                    src={chrome.runtime.getURL('/maskbook-icon-padded.png')}
                    style={{ transform: 'translate(-1px, -1px)' }}
                    width={16}
                    height={16}
                />
                {props.title}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: 6, marginTop: 6, lineHeight: 1.2 }}>
                {props.children}
            </Typography>
            <Divider />
        </>
    )
}
