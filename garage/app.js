import { BaseApp } from '@zeppos/zml/base-app'

let instanceCount = 0;
App(
  BaseApp({
    globalData: {
      dev: false
    },
    onCreate(options) {
      if (instanceCount++ > 0) return
    },
    onDestroy(options) { }
  })
)