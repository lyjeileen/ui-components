// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessageData = { [key: string]: any }

export interface MessageProps {
  id: string
  timestamp: string
  sender: string
  conversationId: string
  format: string
  data: MessageData
  inReplyTo?: string
  threadId?: string
  priority?: string
  taggedParticipants?: string[]
  topicId?: string
}

export interface ThreadableMessage extends MessageProps {
  lastThreadMessage?: MessageProps
  threadMessagesData?: MessageData[]
}

export interface ComponentMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: React.ComponentType<any>
}

export interface WebSocketClient {
  send: (message: MessageProps) => void
  close: () => void
  reconnect: () => void
}

export enum ParticipantRole {
  Owner = 'owner',
  Member = 'member',
}

export enum ParticipantType {
  Human = 'human',
  Agent = 'agent',
}

export interface Participant {
  id: string
  displayName: string
  participantRole: ParticipantRole
  participantType: ParticipantType
}

export interface TextProps {
  text: string
}

export interface UpdateableText extends TextProps {
  updatedData?: { text: string }[]
}

export interface TimeSeriesData {
  timestamp: number
  [key: string]: number
}

export interface ChartSpacing {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type TimeSeriesType = 'line' | 'bar' | 'area'

export interface TimeSeriesFormat {
  /** Data to be displayed in the time series chart. The first field is used as the x-axis field. We currently support formatting epoch timestamps and ISO date strings. Other data types will be displayed as given. */
  timeSeries: TimeSeriesData[]
  /** Array of y-axis reference lines. */
  referenceLineYAxis?: number[]
  /** Array of y-axis reference line colors. Hex color codes and string colors are both supported for defining colors. If not provided, all lines default to grey. Skip providing a custom color for a certain y-axis by providing an empty string. */
  referenceLineColor?: string[]
  /** Array of y-axis reference line labels. Skip providing a custom label for a certain y-axis by providing an empty string. */
  referenceLineLabel?: string[]
  /** Array of y-axis reference line stroke widths. If not provided, all lines default to 1. Skip providing a custom stroke width for a certain y-axis by providing an empty string. */
  referenceLineStrokeWidth?: number[]
  /** Title of the time series chart. */
  title?: string
  /** Description of the time series chart. */
  description?: string
  /** Aspect ratio of the chart. */
  aspectRatio?: number
  /** Width of the chart in pixels. */
  width?: number
  /** Chart type toggle will be hidden if the value is true. */
  disableChartTypeToggle?: boolean
  /** Define the default chart type: 'line', 'bar', or 'area'. */
  defaultChartType?: TimeSeriesType
  /** Minimum width of the chart in pixels. */
  minChartWidth?: number
  /** Maximum width of the chart in pixels. */
  maxHeight?: number
  /** Updated data will be added to the original time series data. */
  updatedData?: { timeSeries: TimeSeriesData[] }[]
  /** Pass a function to format y-axis label. Make sure to use tooltipFormatter and yAxisTickFormatter together so that the numbers are uniform. */
  yAxisTickFormatter?: (value: number) => string
}
