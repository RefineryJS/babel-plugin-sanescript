import {Map as IMap} from 'immutable'

import MKMap from './mkmap'

const PRIORITY = Symbol('ss_plugin_priority')

function numOf (value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }
  return value
}

function prioritySorter ({[PRIORITY]: left}, {[PRIORITY]: right}) {
  // Highest priority first
  return numOf(right) - numOf(left)
}

export function loadPlugins (plugins, types, options) {
  const mapVisitors = new Map()
  const mapModifiers = IMap().asMutable()

  for (let [id, init] of IMap(plugins)) {
    if (init == null) continue

    const {priority, visitor, ...others} = typeof init === 'function'
      ? init({types, option: options[id]})
      : init

    if (visitor != null) {
      visitor[PRIORITY] = priority
      mapVisitors.set(id, visitor)
    }

    const otherFields = IMap(others)
    if (otherFields.size > 0) {
      for (let [topic, modifiers] of otherFields) {
        mapModifiers.set(IMap({id, topic}), modifiers)
      }
    }
  }

  return {
    visitors: IMap(mapVisitors).sort(prioritySorter),
    state: MKMap(['id', 'topic'], mapModifiers)
  }
}
