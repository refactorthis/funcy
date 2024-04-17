import { Context } from 'aws-lambda'

/**
 * Function that returns a mock context object for testing AWS Lambda functions
 *
 * @param options object with context properties
 * @param cb callback function to be called with the value passed into any of the context methods.
 * The callback should contain the test assertions.
 *
 **/
export const ctx = (options: any = {}, cb: (arg: any) => void = () => {}): Context => {
  return {
    succeed: function (result: any) {
      if (result === undefined) {
        return cb(null)
      } else {
        if (typeof result !== 'string') {
          return cb(JSON.stringify(result))
        } else {
          return cb(result)
        }
      }
    },
    fail: function (error) {
      if (error === undefined) {
        return cb(null)
      } else {
        return cb(error)
      }
    },
    done: function (err, result) {
      if (err) {
        return this.fail(err)
      } else {
        return this.succeed(result)
      }
    },
    getRemainingTimeInMillis: function () {
      if (typeof this.timeInMillis !== 'number') {
        return 0
      } else {
        return this.timeInMillis
      }
    },
    functionName: options.functionName || '',
    functionVersion: options.functionVersion || '',
    invokedFunctionArn: options.invokedFunctionArn || '',
    memoryLimitInMB: options.memoryLimitInMB || '',
    awsRequestId: options.awsRequestId || '',
    logGroupName: options.logGroupName || '',
    logStreamName: options.logStreamName || '',
    identity: options.identity || {},
    clientContext: options.clientContext || {},
    callbackWaitsForEmptyEventLoop: options.callbackWaitsForEmptyEventLoop || false,
  }
}
