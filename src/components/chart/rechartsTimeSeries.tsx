import './rechartsTimeSeries.css'

import Crop32Icon from '@mui/icons-material/Crop169'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { Fragment, useEffect, useState } from 'react'
import React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  calculateTimeDiffInDays,
  defaultTimeSeriesProps,
  formatTimestampLabel,
} from '../helper'
import type { ChartSpacing, TimeSeriesFormat, TimeSeriesType } from '../types'
import TimeSeriesWrapper from './timeSeriesWrapper'

const TimeSeriesComponents = {
  line: LineChart,
  bar: BarChart,
  area: AreaChart,
}

export interface RechartsTimeSeriesFormat extends TimeSeriesFormat {
  /** An array containing a predefined set of Hex color codes or string colors (e.g. 'blue'). The colors will be applied to the keys of the data object in order. */
  chartColors: string[]
  /** Callback function to be called when a data point on the graph is clicked. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (...args: any[]) => any
  /** Width of the y-axis labels in pixels. */
  yAxisLabelWidth?: number
  /** Pass a function to format tooltip content. */
  tooltipFormatter?: (value: number, name: string) => [string, string]
  /** Margin of chart container in pixel. For example, adding left margin could show larger numbers properly. */
  chartContainerMargin?: ChartSpacing
}

//All of lines should be shown initially
function showAllDatasets(yAxisFields: string[]) {
  const initialVisibility: { [key: string]: boolean } = {}

  yAxisFields.forEach((yAxisField) => {
    initialVisibility[yAxisField] = true
  })

  return initialVisibility
}

function areAllDatasetsVisible(datasetsVisibility: { [key: string]: boolean }) {
  return Object.values(datasetsVisibility).every((value) => value === true)
}

function RechartsTimeSeries(props: RechartsTimeSeriesFormat) {
  const [timeSeriesType, setTimeSeriesType] = useState<TimeSeriesType>(
    props.defaultChartType || 'line'
  )
  const [timeSeries, setTimeSeries] = useState<object[]>(props.timeSeries)

  const dataFields = timeSeries.length > 0 ? Object.keys(timeSeries[0]) : []
  const xAxisField = dataFields[0]
  const yAxisFields = dataFields.slice(1)

  const [datasetsVisibility, setDatasetsVisibility] = useState<{
    [key: string]: boolean
  }>(showAllDatasets(yAxisFields))

  useEffect(() => {
    if (props.updatedData && props.updatedData.length > 0) {
      let newData = [...props.timeSeries]
      props.updatedData.forEach((data) => {
        newData = newData.concat(data.timeSeries)
        setTimeSeries(newData)
      })
    }
  }, [props.timeSeries, props.updatedData])

  const TimeSeriesParentComponent = TimeSeriesComponents[timeSeriesType]

  function handleLegendClick(clickedDataKey: string) {
    const isTheOnlyVisibleDataset =
      datasetsVisibility[clickedDataKey] &&
      !yAxisFields.find(
        (key) => key !== clickedDataKey && datasetsVisibility[key]
      )

    // If all lines are initially visible, only show the selected line and hide other lines
    if (areAllDatasetsVisible(datasetsVisibility)) {
      const newDatasetsVisibility: { [key: string]: boolean } = {}
      for (const key of yAxisFields) {
        const isSelected = key === clickedDataKey
        newDatasetsVisibility[key] = isSelected
      }
      setDatasetsVisibility(newDatasetsVisibility)
    } else {
      // If the clicked line is the only visible line, reset visibility to initial state
      if (isTheOnlyVisibleDataset) {
        setDatasetsVisibility(showAllDatasets(yAxisFields))
      } else {
        // Otherwise, toggle the visibility of the clicked line
        setDatasetsVisibility({
          ...datasetsVisibility,
          [clickedDataKey]: !datasetsVisibility[clickedDataKey],
        })
      }
    }
  }

  function renderChartComponent(key: string, index: number) {
    const colorIndex = index % props.chartColors.length
    const chartColor = datasetsVisibility[key]
      ? props.chartColors[colorIndex]
      : 'transparent'

    const onClickFields = {
      onClick: props.onClick,
      cursor: 'pointer',
    }

    switch (timeSeriesType) {
      case 'line':
        return (
          <Line
            type="monotone"
            // TODO make animation configurable - task <5870438845>
            isAnimationActive={false}
            dataKey={key}
            name={key}
            key={key}
            dot={false}
            stroke={chartColor}
            activeDot={props.onClick && onClickFields}
          />
        )
      case 'bar':
        return (
          <Bar
            key={key}
            dataKey={key}
            fill={chartColor}
            onClick={props.onClick && onClickFields.onClick}
            cursor={props.onClick && onClickFields.cursor}
          />
        )
      case 'area':
        return (
          <Fragment key={key}>
            <defs>
              <linearGradient id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              key={key}
              isAnimationActive={false}
              dataKey={key}
              type="monotone"
              stroke={chartColor}
              fillOpacity={1}
              fill={`url(#color${key})`}
              activeDot={props.onClick && onClickFields}
            />
          </Fragment>
        )
    }
  }

  function getLegendColor(dataKey: string, index: number): string {
    return datasetsVisibility[dataKey]
      ? props.chartColors[index % props.chartColors.length]
      : 'grey'
  }

  function getLegendTextDecorationStyle(dataKey: string): string {
    return datasetsVisibility[dataKey] ? 'none' : 'line-through'
  }

  function renderLegend() {
    return (
      <Box className="rustic-recharts-time-series-legend">
        {yAxisFields.map((dataKey, index) => (
          <Box
            key={index}
            className="rustic-recharts-time-series-legend-item"
            onClick={() => handleLegendClick(dataKey)}
            data-cy="legend-item"
          >
            <Crop32Icon
              sx={{
                color: getLegendColor(dataKey, index),
              }}
            />
            <Typography
              variant="body2"
              display="inline"
              sx={{
                color: getLegendColor(dataKey, index),
                textDecorationLine: getLegendTextDecorationStyle(dataKey),
              }}
            >
              {dataKey}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  let timeSeriesDuration: number
  if (props.timeSeries.length > 0) {
    const lastTimeSeriesItem = props.timeSeries[props.timeSeries.length - 1]
    const firstTimeSeriesItem = props.timeSeries[0]

    timeSeriesDuration = calculateTimeDiffInDays(
      firstTimeSeriesItem[xAxisField],
      lastTimeSeriesItem[xAxisField]
    )
  }

  // eslint-disable-next-line no-console
  console.log(timeSeriesType)
  return (
    <TimeSeriesWrapper
      timeSeriesType={timeSeriesType}
      setTimeSeriesType={setTimeSeriesType}
      timeSeries={props.timeSeries}
      disableChartTypeToggle={props.disableChartTypeToggle}
      title={props.title}
      description={props.description}
    >
      <ResponsiveContainer
        aspect={props.aspectRatio}
        width={props.width}
        maxHeight={props.maxHeight}
        minWidth={props.minChartWidth}
        data-cy={`${timeSeriesType}-chart`}
      >
        <TimeSeriesParentComponent
          data={timeSeries}
          margin={props.chartContainerMargin}
        >
          <XAxis
            dataKey={xAxisField}
            tickFormatter={(value) =>
              formatTimestampLabel(value, timeSeriesDuration)
            }
          />
          <YAxis
            domain={['auto', 'auto']}
            width={props.yAxisLabelWidth}
            tickFormatter={props.yAxisTickFormatter}
          />
          <Tooltip
            labelFormatter={(label: number) => [
              formatTimestampLabel(label, timeSeriesDuration),
            ]}
            formatter={props.tooltipFormatter}
          />
          <Legend content={renderLegend} />

          {yAxisFields.map((key, index) =>
            datasetsVisibility[key] ? renderChartComponent(key, index) : null
          )}
          {props.referenceLineYAxis &&
            props.referenceLineYAxis.map((referenceLine, index) => {
              return (
                <ReferenceLine
                  key={index}
                  y={referenceLine}
                  label={
                    props.referenceLineLabel && props.referenceLineLabel[index]
                  }
                  stroke={
                    props.referenceLineColor && props.referenceLineColor[index]
                  }
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                  strokeWidth={
                    props.referenceLineStrokeWidth &&
                    props.referenceLineStrokeWidth[index]
                  }
                  isFront
                />
              )
            })}
        </TimeSeriesParentComponent>
      </ResponsiveContainer>
    </TimeSeriesWrapper>
  )
}

RechartsTimeSeries.defaultProps = {
  ...defaultTimeSeriesProps,
  yAxisLabelWidth: 30,
}

export default RechartsTimeSeries
