import { FontInstance, LedMatrixInstance } from "rpi-led-matrix"

export type Fonts = Record<string, FontInstance>

export interface IQueryString {
  team: string
}
export interface IBody {
  groupKey: string
  status: string
}

export type Team = 'access' | 'core' | 'services' | 'observer'

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
  iterator: number
}
