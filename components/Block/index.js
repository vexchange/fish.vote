import { Wrapper } from "./styled";

const Block = ({ children }) => (
  <Wrapper>
    { children }
  </Wrapper>
);

export const Col = ({ children }) => (
  <div>
    { children }
  </div>
);

export default Block;
