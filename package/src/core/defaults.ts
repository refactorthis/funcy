import { FuncyOptions } from './types'

export const baseOptions: FuncyOptions = {
  monitoring: {
    logLevel: 'info',
    logger: () => console,
    cloudWatchMetrics: false,
    enableProfiling: false,
  },
}
