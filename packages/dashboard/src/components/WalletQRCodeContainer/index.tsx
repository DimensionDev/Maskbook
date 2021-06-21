import { memo } from 'react'
import { experimentalStyled as styled } from '@material-ui/core'

const QRCodeContainer = styled('div')(
    ({ width, height, border: { borderWidth, borderHeight } }: WalletQRCodeProps) => `
    width: ${width}px;
    height: ${height}px;
    background: linear-gradient(to right, black ${borderHeight}px, transparent ${borderHeight}px) 0 0,
    linear-gradient(to right, black ${borderHeight}px, transparent ${borderHeight}px) 0 100%,
    linear-gradient(to left, black ${borderHeight}px, transparent ${borderHeight}px) 100% 0,
    linear-gradient(to left, black ${borderHeight}px, transparent ${borderHeight}px) 100% 100%,
    linear-gradient(to bottom, black ${borderHeight}px, transparent ${borderHeight}px) 0 0,
    linear-gradient(to bottom, black ${borderHeight}px, transparent ${borderHeight}px) 100% 0,
    linear-gradient(to top, black ${borderHeight}px, transparent ${borderHeight}px) 0 100%,
    linear-gradient(to top, black ${borderHeight}px, transparent ${borderHeight}px) 100% 100%;

    background-repeat: no-repeat;
    background-size: ${borderWidth}px ${borderWidth}px;
    padding: ${borderHeight}px;
`,
)

export interface WalletQRCodeProps extends React.PropsWithChildren<{}> {
    width: number
    height: number
    border: {
        borderWidth: number
        borderHeight: number
    }
}

export const WalletQRCodeContainer = memo((props: WalletQRCodeProps) => {
    return <QRCodeContainer {...props}>{props.children}</QRCodeContainer>
})
