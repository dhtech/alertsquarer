import { FontInstance, LedMatrixInstance } from 'rpi-led-matrix'

export interface IQueryString {
  team: Team | 'heartbeat'
}
export interface IBody {
  groupKey: string
  status: string
}

export type Team = 'access' | 'core' | 'services'

export interface Alert {
  team: Team
  groupKey: string
  status: string
  timestamp: number
}
export type Alerts = Record<string, Alert>

export interface Data {
  alerts: Alerts
  heartbeatTS: number
}

export interface drawStateProps {
  matrix: LedMatrixInstance
  fonts: Record<string, FontInstance>
  panel: number
  name: string
  errCnt: number
  heartbeatTimeout: boolean
  showHeart: boolean
  n: number
}
