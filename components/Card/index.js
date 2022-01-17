import { useMemo } from 'react'
import { Tooltip } from 'react-tippy';

import {
  Header,
  Title,
  Subtitle,
  Wrapper,
} from './styled';

import Button from '../Button'

const disabledOptions = ['Connect wallet']

const Card = ({
  action: {
    name = null,
    handler,
    disabled = false,
    loading = false,
    loadingText = "",
    background = null,
    color = null,
  } = {},
  children,
  shortMargin,
  subtitle,
  title,
  noPadding,
}) => {
  const getContent = useMemo(() => {
    switch (name) {
      case 'Timelock Pending':
        return 'Timelock has a 2 day delay'
      case 'Create Proposal':
        return 'Ensure you have at least 100,000 VEX to create a proposal'
      default:
        return ''
    }
  }, [name])

  return (
    <Wrapper shortMargin={shortMargin} noPadding={noPadding}>
      { title ? (
        <Header noPadding={noPadding}>
          <Title>
            {title}
          </Title>
          <div>
            { subtitle ? <Subtitle>{ subtitle }</Subtitle> : null}
            { name ? (
              <Tooltip
                interactive
                useContext
                distance={20}
                position='top'
                trigger='mouseenter'
                disabled={disabledOptions.includes(name)}
                html={(
                  <div>{ getContent }</div>
                )}
              >
                <Button
                  onClick={handler}
                  background={background ? background : null}
                  color={color ? color : null}
                  disabled={disabled || loading}
                >
                  {!loading ? name : loadingText}
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </Header>
      ) : null}
      <div>{children}</div>
    </Wrapper>
  )
}

export default Card;
