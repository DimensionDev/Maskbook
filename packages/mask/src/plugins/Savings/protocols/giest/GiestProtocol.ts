import { ProtocolType } from '../../types'
import AAVELikeProtocol from '../common/protocol/AAVELikeProtocol'

export class GiestProtocol extends AAVELikeProtocol {
    override get type() {
        return ProtocolType.Giest
    }
}
