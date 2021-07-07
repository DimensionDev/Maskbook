import { experimentalStyled as styled } from '@material-ui/core'
import { memo } from 'react'
import { useI18N } from '../../../../utils'
import { UploadFile } from './UploadFile'
import { UploadFileButtons } from './UploadFileButtons'

export interface UploadFilePageProps {
    onChange?: () => void
}

const Container = styled('div')`
    display: flex;
    height: 300px;
    padding: 8px 0;
`

export const UploadFilePage = memo<UploadFilePageProps>(({ onChange }) => {
    const { t } = useI18N()
    const onFile = (file: File) => {
        console.log(file)
    }
    return (
        <Container>
            <UploadFile onFile={onFile} />
            <UploadFileButtons />
        </Container>
    )
})
