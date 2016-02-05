export const getGetState = (state, id) => topic => state.get({id, topic})

export const getMutateState = (state) => (topic, mutator) => {
  if (typeof mutator !== 'function') throw new Error('SaneScript - Mutator must be a function')

  for (let [id, oldState] of state.get({topic})) {
    const newState = mutator(oldState)
    state.set({id, topic}, newState)
  }
}
