export interface WheelItem {
  id: string;
  text: string;
  color: string;
}

export enum GeminiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
