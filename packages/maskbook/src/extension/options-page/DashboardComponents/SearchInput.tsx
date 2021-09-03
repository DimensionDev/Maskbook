import { SearchIcon } from '@masknet/icons'
import { InputBox, InputBoxProps } from './InputBox'

export interface SearchInputProps extends InputBoxProps {}
export function SearchInput(props: SearchInputProps) {
    return <InputBox {...props} children={<SearchIcon />} />
}
