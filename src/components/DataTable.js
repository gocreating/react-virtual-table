import React, { Component } from 'react'
import PropTypes from 'prop-types'
import throttle from 'lodash/throttle'
import styled, { css } from 'styled-components'

/**
 * Wrapper
 */
const Wrapper = styled.div`
  position: relative;
`

/**
 * Scroller
 */
const Scroller = styled.div`
  overflow-x: auto;
  overflow-y: visible;
  max-width: 100%;
  float: left;
  width: auto;
  ${({ maxHeight }) => maxHeight && css`
    max-height: ${maxHeight}px;
  `}
`

Scroller.propTypes = {
  maxHeight: PropTypes.number,
}

/**
 * Table
 */
const StyledTable = styled.table`
  border-collapse: collapse;
  background-color: #26282b;
`

/**
 * THead
 */
const THead = styled.thead`
`

/**
 * TBody
 */
const TBody = styled.tbody`
`

/**
 * Tr
 */
const Tr = styled.tr`
  overflow: hidden;
  background-color: rgb(62, 63, 66);
  ${({ width }) => width && css`
    width: ${width}px;
  `}
  ${props => {
    if (props.globalSticky) {
      return css`
        position: fixed;
        top: 0px;
      `
    }
    if (props.localSticky) {
      return css`
        position: absolute;
        top: 0px;
      `
    }
  }}
  ${({ bottomShadow }) => bottomShadow && css`
    box-shadow: 0 15px 15px -15px rgba(0, 0, 0, 1);
  `}
`

Tr.propTypes = {
  width: PropTypes.number,
  globalSticky: PropTypes.bool,
  localSticky: PropTypes.bool,
  bottomShadow: PropTypes.bool,
};

Tr.defaultProps = {
  globalSticky: false,
  localSticky: false,
  bottomShadow: false,
};

/**
 * StyledTh
 */
const StyledTh = styled.th`
  text-align: left;
  background-color: rgba(255, 255, 255, 0.1);
  color: #aaaaaa;
  white-space: nowrap;
  ${({ cellWidth }) => css`
    min-width: ${cellWidth}px;
  `}
  height: ${(props) => props.height}px;
`

StyledTh.propTypes = {
  height: PropTypes.number,
}

/**
 * Th
 */
const Th = (props, { headerRowHeight }) => (
  <StyledTh height={headerRowHeight} {...props}  />
)

Th.contextTypes = {
  headerRowHeight: PropTypes.number,
};

/**
 * StyledTd
 */
const StyledTd = styled.td`
  text-align: left;
  background-color: rgba(255, 255, 255, 0.06);
  white-space: nowrap;
  color: #ffffff;
  ${({ cellWidth }) => css`
    min-width: ${cellWidth}px;
  `}
  height: ${props => props.height}px;
`

StyledTd.propTypes = {
  height: PropTypes.number,
}

/**
 * Td
 */
const Td = (props, { rowHeight }) => (
  <StyledTd height={rowHeight} {...props}  />
)

Td.contextTypes = {
  rowHeight: PropTypes.number.isRequired,
};

/**
 * ClearFloat
 */
const ClearFloat = styled.div`
  clear: both;
`

/**
 * DataTable
 */
class DataTable extends Component {
  constructor(props) {
    super(props)
    this.scroller = React.createRef()
    this.tHeadTr = React.createRef()
    this.state = {
      scrollerClientWidth: 0,
      scrollerHeight: 0,
      renderFromIndex: 0,
      renderToIndex: 0,
      isGlobalHeaderSticky: false,
      isLocalHeaderSticky: false,
    }
  }

  getChildContext() {
    const { headerRowHeight, rowHeight } = this.props
    return {
      headerRowHeight,
      rowHeight,
    }
  }

  componentDidMount() {
    this.addListeners()
  }

  componentDidUpdate(prevProps, prevState) {
    const { globalStickyHeader, maxHeight, throttleWait } = this.props
    const { isGlobalHeaderSticky } = this.state
    const prevMaxHeight = prevProps.maxHeight
    const prevThrottleWait = prevProps.throttleWait
    const prevIsHeaderSticky = prevState.isGlobalHeaderSticky

    if (
      globalStickyHeader &&
      isGlobalHeaderSticky !== prevIsHeaderSticky &&
      isGlobalHeaderSticky === true
    ) {
      this.syncStickyHeaderScrollLeft()
    }
    if (
      maxHeight !== prevMaxHeight ||
      throttleWait !== prevThrottleWait
    ) {
      this.removeListeners()
      this.addListeners()
    }
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  isAutoHeight = (props) => {
    const { maxHeight } = (props || this.props)
    return maxHeight < 0
  }

  addListeners = () => {
    const { throttleWait } = this.props
    this.throttledHandleWindowResize = throttle(this.handleWindowResize, throttleWait)
    this.throttledHandleWindowScroll = throttle(this.handleWindowScroll, throttleWait)
    this.throttledHandleScrollerScroll = throttle(this.handleScrollerScroll, 10)
    this.handleWindowResize()
    this.handleWindowScroll()
    this.handleScrollerScroll()
    window.addEventListener('resize', this.throttledHandleWindowResize)
    window.addEventListener('scroll', this.throttledHandleWindowScroll)
    this.scroller.current.addEventListener('scroll', this.throttledHandleScrollerScroll)
  }

  removeListeners = () => {
    window.removeEventListener('resize', this.throttledHandleWindowResize)
    if (this.isAutoHeight()) {
      window.removeEventListener('scroll', this.throttledHandleWindowScroll)
    } else {
      this.scroller.current.removeEventListener('scroll', this.throttledHandleWindowScroll)
    }
  }

  handleWindowResize = () => {
    const { maxHeight } = this.props
    const scrollerClientWidth = this.scroller.current.clientWidth
    let scrollerHeight
    if (this.isAutoHeight()) {
      scrollerHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    } else {
      scrollerHeight = maxHeight
    }
    this.setState({
      scrollerClientWidth,
      scrollerHeight,
    }, () => {
      this.handleWindowScroll()
    })
  }

  getRenderIndexRange = (tbodyTopY, tbodyBottomY) => {
    const { rowHeight, data } = this.props
    const { scrollerHeight } = this.state
    let renderFromIndex
    let renderToIndex

    if (tbodyTopY >= 0) {
      renderFromIndex = 0
    } else {
      renderFromIndex = Math.min(Math.floor(-tbodyTopY / rowHeight), data.length - 1)
    }
    if (tbodyBottomY - scrollerHeight >= 0) {
      renderToIndex = data.length - 1 - Math.floor((tbodyBottomY - scrollerHeight) / rowHeight)
    } else {
      renderToIndex = data.length - 1
    }

    return {
      renderFromIndex,
      renderToIndex,
    }
  }

  handleWindowScroll = () => {
    const { preRenderRowCount, headerRowHeight, rowHeight, data } = this.props
    const rectScroller = this.scroller.current.getBoundingClientRect()
    let newState = {}

    if (this.isAutoHeight()) {
      const detectMargin = preRenderRowCount * rowHeight
      const tbodyHeight = rowHeight * data.length
      const tbodyTopY = rectScroller.top + headerRowHeight + detectMargin
      const tbodyBottomY = rectScroller.top + headerRowHeight + tbodyHeight - detectMargin
      const { renderFromIndex, renderToIndex } = this.getRenderIndexRange(tbodyTopY, tbodyBottomY)
      newState = {
        ...newState,
        renderFromIndex,
        renderToIndex,
      }
    }

    const topOffset = 0
    const bottomOffset = 0
    const isGlobalHeaderSticky = (
      rectScroller.top <= -topOffset &&
      rectScroller.bottom > headerRowHeight - bottomOffset
    )
    newState = {
      ...newState,
      isGlobalHeaderSticky,
    }

    this.setState(newState)
  }

  handleScrollerScroll = () => {
    const { preRenderRowCount, headerRowHeight, rowHeight, data, globalStickyHeader } = this.props

    if (globalStickyHeader) {
      this.syncStickyHeaderScrollLeft()
    }
    if (!this.isAutoHeight()) {
      const scrollerScrollTop = this.scroller.current.scrollTop
      const detectMargin = preRenderRowCount * rowHeight
      const tbodyHeight = rowHeight * data.length
      const tbodyTopY = -scrollerScrollTop + headerRowHeight + detectMargin
      const tbodyBottomY = -scrollerScrollTop + headerRowHeight + tbodyHeight - detectMargin
      const { renderFromIndex, renderToIndex } = this.getRenderIndexRange(tbodyTopY, tbodyBottomY)

      const isLocalHeaderSticky = (scrollerScrollTop > 0)

      this.setState({
        renderFromIndex,
        renderToIndex,
        isLocalHeaderSticky,
      })
    }
  }

  syncStickyHeaderScrollLeft = () => {
    this.tHeadTr.current.scrollLeft = this.scroller.current.scrollLeft
  }

  render() {
    const {
      data,
      maxHeight,
      headerRowHeight,
      rowHeight,
      globalStickyHeader,
      localStickyHeader,
      enableStickyHeaderShadow,
      renderHeader,
      renderRow,
    } = this.props
    const {
      renderFromIndex,
      renderToIndex,
      isGlobalHeaderSticky,
      isLocalHeaderSticky,
      scrollerClientWidth,
    } = this.state
    const renderedLength = (
      renderToIndex > renderFromIndex ?
      renderToIndex - renderFromIndex + 1 :
      1
    )
    return (
      <Wrapper>
        <Scroller
          ref={this.scroller}
          maxHeight={this.isAutoHeight() ? undefined : maxHeight}
        >
          <StyledTable>
            <DataTable.TBody>
              {
                React.cloneElement(
                  renderHeader(),
                  {
                    ref: this.tHeadTr,
                    globalSticky: (globalStickyHeader && isGlobalHeaderSticky),
                    localSticky: (localStickyHeader && isLocalHeaderSticky),
                    width: (isGlobalHeaderSticky || isLocalHeaderSticky) ? scrollerClientWidth : undefined,
                    bottomShadow: (
                      enableStickyHeaderShadow && (
                        (globalStickyHeader && isGlobalHeaderSticky) ||
                        (localStickyHeader && isLocalHeaderSticky)
                      )
                    ),
                  },
                )
              }
              {
                (
                  (globalStickyHeader && isGlobalHeaderSticky) ||
                  (localStickyHeader && isLocalHeaderSticky)
                ) && (
                  <Tr height={headerRowHeight} />
                )
              }
              {renderFromIndex > 0 && (
                <Tr height={rowHeight * renderFromIndex} />
              )}
              {
                Array(renderedLength)
                  .fill(0)
                  .map((_, idx) => idx + renderFromIndex)
                  .map(dataIndex => {
                    const record = data[dataIndex]
                    {/* when data is updated and row count is decreased, dataIndex may become out of bound */}
                    if (record) {
                      return renderRow(data[dataIndex], dataIndex, data)
                    }
                    return null
                  })
              }
              {renderToIndex < data.length - 1 && (
                <Tr height={rowHeight * (data.length - renderToIndex)} />
              )}
            </DataTable.TBody>
          </StyledTable>
        </Scroller>
        <ClearFloat />
      </Wrapper>
    )
  }
}

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  headerRowHeight: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number,
  throttleWait: PropTypes.number,
  preRenderRowCount: PropTypes.number,
  globalStickyHeader: PropTypes.bool,
  localStickyHeader: PropTypes.bool,
  enableStickyHeaderShadow: PropTypes.bool,
  renderHeader: PropTypes.func,
  renderRow: PropTypes.func,
}

DataTable.childContextTypes = {
  headerRowHeight: PropTypes.number,
  rowHeight: PropTypes.number,
}

DataTable.defaultProps = {
  maxHeight: -1,
  throttleWait: 200,
  preRenderRowCount: 0,
  globalStickyHeader: false,
  localStickyHeader: false,
  enableStickyHeaderShadow: true,
  renderHeader: () => {},
  renderRow: () => {},
}

/**
 * Exposed Components
 */
DataTable.THead = THead
DataTable.TBody = TBody
DataTable.Tr = Tr
DataTable.Th = Th
DataTable.Td = Td

export default DataTable
