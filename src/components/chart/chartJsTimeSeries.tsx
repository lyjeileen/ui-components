/* eslint-disable no-console */
import type { ActiveElement, ChartEvent, TooltipItem } from 'chart.js'
import Chart from 'chart.js/auto'
import type {
  AnnotationOptions,
  AnnotationTypeRegistry,
} from 'chartjs-plugin-annotation'
import annotationPlugin from 'chartjs-plugin-annotation'
import React, { useEffect, useRef, useState } from 'react'

import {
  calculateTimeDiffInDays,
  defaultTimeSeriesProps,
  formatTimestampLabel,
} from '../helper'
import type { ChartSpacing, TimeSeriesFormat, TimeSeriesType } from '../types'
import TimeSeriesWrapper from './timeSeriesWrapper'

export interface ChartJsTimeSeriesFormat extends TimeSeriesFormat {
  /** Used to customize border/line colors. An array containing a predefined set of CSS Colors. Hex, RGB, cross-browser color names as well as other color methods (See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) are supported. The colors will be applied to the keys of the data object in order. */
  chartLineColors?: string[]
  /** Used to customize fill colors. If chartLineColors is provided, but this props is missing, chartLineColors will be used as fill colors instead. An array containing a predefined set of CSS Colors. Hex, RGB, HSL and cross-browser color names are supported. Hex, RGB, cross-browser color names as well as other color methods (See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) are supported. The colors will be applied to the keys of the data object in order. */
  chartFillColors?: string[]
  /** Callback function to be called when a data point on the graph is clicked. */
  onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  /** Pass a function to format tooltip content. Context can be used to access additional data like the dataset the item belongs to. */
  tooltipFormatter?: (
    context: TooltipItem<'line' | 'bar'>
  ) => string | void | string[]
  /** Padding of chart container in pixel. */
  chartContainerPadding?: ChartSpacing
}

function ChartJsTimeSeries(props: ChartJsTimeSeriesFormat) {
  const chartRef = useRef<HTMLCanvasElement>(null) // Reference to the canvas element
  const [timeSeriesType, setTimeSeriesType] = useState<TimeSeriesType>(
    props.defaultChartType || 'line'
  )
  const dataFields =
    props.timeSeries.length > 0 ? Object.keys(props.timeSeries[0]) : []
  const xAxisField = dataFields[0]
  const yAxisFields = dataFields.slice(1)

  Chart.register(annotationPlugin)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        const lastTimeSeriesItem = props.timeSeries[props.timeSeries.length - 1]
        const firstTimeSeriesItem = props.timeSeries[0]

        const timeSeriesDuration = calculateTimeDiffInDays(
          firstTimeSeriesItem[xAxisField],
          lastTimeSeriesItem[xAxisField]
        )

        const convertedData = yAxisFields.map((key) =>
          props.timeSeries.map((item) => item[key])
        )

        const referenceLines: AnnotationOptions<
          keyof AnnotationTypeRegistry
        >[] = []

        if (props.referenceLineYAxis) {
          props.referenceLineYAxis.forEach((yValue, index) => {
            referenceLines.push({
              type: 'line',
              yMin: yValue,
              yMax: yValue,
              //   label: props.referenceLineLabel && {
              //     display: true,
              //     content: props.referenceLineLabel[index],
              //     position: 'center',
              //     color: 'grey',
              //     backgroundColor: '#00000000',
              //   },
              borderWidth:
                props.referenceLineStrokeWidth &&
                props.referenceLineStrokeWidth[index],
              borderColor:
                props.referenceLineColor && props.referenceLineColor[index],
              // eslint-disable-next-line no-magic-numbers
              borderDash: [3, 3],
            })
            // referenceLines.push({
            //   type: 'label',
            //   yValue: yValue,
            //   backgroundColor: '#00000000',
            //   content: props.referenceLineLabel[index],
            //   //   yAdjust: -2,
            // })
          })
        }
        const myChart = new Chart(ctx, {
          type: timeSeriesType === 'area' ? 'line' : timeSeriesType,
          data: {
            labels: props.timeSeries.map((item) =>
              formatTimestampLabel(item[xAxisField], timeSeriesDuration)
            ),
            datasets: convertedData.map((item, index) => ({
              label: yAxisFields[index],
              data: item,
              backgroundColor: props.chartFillColors
                ? props.chartFillColors[index]
                : props.chartLineColors && props.chartLineColors[index],
              borderColor:
                props.chartLineColors && props.chartLineColors[index],
              borderWidth: 1,
              // eslint-disable-next-line no-magic-numbers
              tension: timeSeriesType === 'area' && 0.4,
              fill: timeSeriesType === 'area' && {
                target: 'origin',
                above: props.chartFillColors && props.chartFillColors[index],
              },
            })),
          },
          options: {
            layout: {
              padding: props.chartContainerPadding,
            },
            onClick: props.onClick,
            plugins: {
              annotation: {
                annotations: referenceLines,
              },
              //   title: {
              //     display: true,
              //     color: '#8b93a2',
              //     align: 'center',
              //     position: 'top',
              //     text: props.title,
              //   },
              //   subtitle: {
              //     display: true,
              //     color: '#8b93a2',
              //     align: 'start',
              //     text: props.description,
              //   },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || ''
                    if (label) {
                      label += ': '
                    }
                    label += props.yAxisTickFormatter
                      ? props.yAxisTickFormatter(context.parsed.y)
                      : context.formattedValue
                    return label
                  },
                },
              },
            },
            // eslint-disable-next-line no-magic-numbers
            aspectRatio: props.aspectRatio || 16 / 9,
            scales: {
              y: {
                ticks: {
                  callback: function (value) {
                    return props.yAxisTickFormatter
                      ? props.yAxisTickFormatter(value as number)
                      : value
                  },
                },
              },
            },
          },
        })

        // Apply pointer cursor
        chartRef.current.addEventListener('mousemove', (event) => {
          const points = myChart.getElementsAtEventForMode(
            event,
            'nearest',
            { intersect: true },
            false
          )
          if (points.length) {
            chartRef.current!.style.cursor = 'pointer'
          } else {
            chartRef.current!.style.cursor = 'default'
          }
        })

        // Cleanup function to destroy the chart when the component unmounts
        return () => {
          myChart.destroy()
        }
      }
    }
  }, [timeSeriesType])

  return (
    <TimeSeriesWrapper
      timeSeriesType={props.defaultChartType || 'line'}
      setTimeSeriesType={setTimeSeriesType}
      timeSeries={props.timeSeries}
      disableChartTypeToggle={props.disableChartTypeToggle}
      title={props.title}
      description={props.description}
    >
      <canvas
        ref={chartRef}
        width={props.width}
        style={{ maxHeight: props.maxHeight, minWidth: props.minChartWidth }}
      />
    </TimeSeriesWrapper>
  )
}

ChartJsTimeSeries.defaultProps = {
  ...defaultTimeSeriesProps,
}

export default ChartJsTimeSeries
