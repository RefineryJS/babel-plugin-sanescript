import {Map as IMap} from 'immutable'

import {getGetState, getMutateState} from './state'

function processVisitor (type, handler, visitorMap) {
  if (typeof handler === 'function') {
    visitorMap.set(type, {enter: handler})
    return
  }

  let {enter, exit} = handler
  if (typeof enter !== 'function') {
    enter = null
  }
  if (typeof exit !== 'function') {
    exit = null
  }

  if (!enter && !exit) return

  visitorMap.set(type, {enter, exit})
}

function normalizeVisitor (visitor) {
  return IMap().withMutations(visitorMap => {
    for (let key of Object.keys(visitor)) {
      const handler = visitor[key]
      for (let type of key.split('|')) {
        processVisitor(type, handler, visitorMap)
      }
    }
  })
}

export function unifyVisitors (mapVisitors, state) {
  const typeToVisitors = new Map()
  for (let [id, visitor] of mapVisitors.map(normalizeVisitor)) {
    for (let [type, {enter, exit}] of visitor) {
      let existingVisitors = typeToVisitors.get(type)
      if (!existingVisitors) {
        existingVisitors = {listEnter: [], listExit: []}
        typeToVisitors.set(type, existingVisitors)
      }
      const {listEnter, listExit} = existingVisitors

      if (enter) {
        listEnter.push({id, visitor: enter})
      }
      if (exit) {
        listExit.push({id, visitor: exit})
      }
    }
  }

  const mergeVisitors = listVisitors => (path) => {
    for (let {id, visitor} of listVisitors) {
      const getState = getGetState(state, id)
      const mutateState = getMutateState(state)
      const stop = visitor(path, getState, mutateState)
      if (stop) return
    }
  }

  const resultVisitor = {}
  for (let [type, {listEnter, listExit}] of typeToVisitors) {
    if (listEnter.length) {
      if (listExit.length) {
        // Both enter and exit visitor exist
        resultVisitor[type] = {
          enter: mergeVisitors(listEnter),
          exit: mergeVisitors(listExit)
        }
      } else {
        // Only enter visitor exist
        resultVisitor[type] = {enter: mergeVisitors(listEnter)}
      }
    } else {
      if (listExit.length) {
        // Only exit visitor exist
        resultVisitor[type] = {exit: mergeVisitors(listExit)}
      }
    }
  }

  return resultVisitor
}
