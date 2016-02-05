import getProgramVisitor from './core'
import * as plugins from './plugin'

export default function babelPluginSaneScript ({types}) {
  return {
    visitor: {
      Program: getProgramVisitor(types, plugins)
    }
  }
}
