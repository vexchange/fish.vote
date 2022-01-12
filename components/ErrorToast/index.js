import { Wrapper, Title } from './styled'

const SuccessToast = ({ description }) => (
  <Wrapper>
    <Title>Something went wrong</Title>
    { description ? <div>{ description }</div> : null }
  </Wrapper>
)

export default SuccessToast;
