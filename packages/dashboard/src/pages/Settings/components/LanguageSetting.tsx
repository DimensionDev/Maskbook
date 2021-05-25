import { MenuItem } from '@material-ui/core'
import { useLanguage } from '../api'
import { Services } from '../../../API'
import SettingSelect from './SettingSelect'

export default function LanguageSetting() {
    const lang = useLanguage()
    const handleChange = (event: any) => {
        Services.Settings.setLanguage(event.target.value)
    }

    return (
        <SettingSelect value={lang} onChange={handleChange}>
            <MenuItem value="zh">中文</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ko">한국인</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
        </SettingSelect>
    )
}
