import {inspect} from 'util'
import {Set as ISet} from 'immutable'

const DONE = Symbol('ss_comparison_operator_done')

const COMPARISON_OPERATORS = ISet([
  '==',
  '!=',
  '===',
  '!==',
  '<',
  '<=',
  '>',
  '>='
])

const isComparison = node => COMPARISON_OPERATORS.has(node.operator)

function extractComparison (node, t) {
  const body = []
  while (t.isBinaryExpression(node) && isComparison(node)) {
    const {left, right, operator} = node
    body.unshift({expression: right, operator})
    node = left
  }
  return {head: node, body}
}

export default function plugin ({types: t}) {
  return {
    priority: 100,
    global_variable: 2,
    visitor: {
      BinaryExpression (path, getState) {
        const {node} = path
        if (node[DONE] || !isComparison(node)) {
          return
        }

        const [gvar1, gvar2] = getState('global_variable')

        const {head, body} = extractComparison(node, t)
        const andChain = body.map(({expression, operator}, index) => {
          return index % 2
            ? makeRing(operator, expression, gvar2, gvar1)
            : makeRing(operator, expression, gvar1, gvar2)
        })
        andChain[0].expressions[1].left = head
        console.log('andChain - ' + inspect(andChain))

        function makeRing (op, expr, v1, v2) {
          const assign = t.assignmentExpression('=', v1, expr)
          const compare = t.binaryExpression(op, v2, v1)
          compare[DONE] = true
          return t.sequenceExpression([assign, compare])
        }

        const result = andChain.reduce((prev, next) => {
          return t.logicalExpression('&&', prev, next)
        })
        path.replaceWith(result)
        return true
      }
    }
  }
}
