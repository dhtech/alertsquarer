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
