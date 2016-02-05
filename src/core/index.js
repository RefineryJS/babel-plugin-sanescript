import {loadPlugins} from './plugin'
import {unifyVisitors} from './visitor'

export default function getProgramVisitor (types, plugins, opts = {}) {
  return function (path, babelState) {
    const options = {...opts, ...babelState.opts}
    const {visitors, state} = loadPlugins(plugins, types, options)

    const finalVisitor = unifyVisitors(visitors, state)
    const {enter, exit} = finalVisitor.Program
    delete finalVisitor.Program

    enter && enter(path)
    path.traverse(finalVisitor)
    exit && exit(path)
  }
}
