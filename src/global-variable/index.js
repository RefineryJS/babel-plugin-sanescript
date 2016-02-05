export default function plugin ({types: t}) {
  return {
    priority: 200,
    visitor: {
      Program (path, getState, mutateState) {
        const {scope, node: {body}} = path
        const gVars = []

        mutateState('global_variable', (state) => {
          if (!Array.isArray(state)) {
            state = Array(state).fill(null)
          }
          return state.map(defolt => {
            const id = scope.generateUidIdentifier('ss_global')
            gVars.push({id, defolt})
            return id
          })
        })

        const varDecl = t.variableDeclaration('let', gVars.map(v => {
          const {id, defolt} = v
          return t.variableDeclarator(id, defolt || t.nullLiteral())
        }))

        body.unshift(varDecl)
      }
    }
  }
}
