import React from 'react'
import { storiesOf } from '@storybook/react'
import { number, boolean } from '@storybook/addon-knobs'
import generateColumns from '../utils/generateColumns'
import generateRows from '../utils/generateRows'
import DemoTable from './DemoTable'

storiesOf('Basic', module)
  .add('default', () => {
    const columnCount = number('Columns', 10)
    const rowCount = number('Rows', 100)

    const columns = generateColumns(columnCount)
    const data = generateRows(rowCount, columns)

    return (
      <DemoTable
        headerRowHeight={44}
        rowHeight={62}
        columns={columns}
        data={data}
      />
    )
  })
  .add('custom props', () => {
    const demoTableGroup = 'Demo Table'
    const propsGroup = 'Props'

    const columnCount = number('Columns', 10, {}, demoTableGroup)
    const rowCount = number('Rows', 50, {}, demoTableGroup)
    const enableMaxHeight = boolean('Enable max height', false, demoTableGroup)

    const maxHeight = number(`maxHeight ${enableMaxHeight ? '(enabled)' : '(disabled)'}`, 500, {}, propsGroup)
    const throttleWait = number('throttleWait', 200, {}, propsGroup)
    const preRenderRowCount = number('preRenderRowCount', 0, {}, propsGroup)
    const globalStickyHeader = boolean('globalStickyHeader', false, propsGroup)
    const columns = generateColumns(columnCount)
    const data = generateRows(rowCount, columns)

    return (
      <div>
        <p>Content Before Table</p>
        <p>Content Before Table</p>
        <p>Content Before Table</p>
        <p>Content Before Table</p>
        <p>Content Before Table</p>
        <p>Content Before Table</p>
        <p>Content Before Table</p>
        <DemoTable
          headerRowHeight={44}
          rowHeight={62}
          columns={columns}
          data={data}
          maxHeight={enableMaxHeight ? maxHeight : undefined}
          throttleWait={throttleWait}
          preRenderRowCount={preRenderRowCount}
          globalStickyHeader={globalStickyHeader}
        />
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
        <p>Content After Table</p>
      </div>
    )
  })
