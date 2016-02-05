import {Map as IMap, Set as ISet, is} from 'immutable'

export default function MultiKeyMap (keyNames, map = IMap()) {
  return {
    keyNames: ISet(keyNames),
    map,
    get (keys) {
      keys = IMap(keys)
      const {keyNames, map} = this
      const validKeys = keys
        .toKeyedSeq()
        .filter((v, k) => keyNames.has(k))
        .toMap()
      const validKeyNames = ISet(validKeys.keys())

      if (keyNames.isSubset(validKeyNames)) {
        return map.get(validKeys)
      } else {
        const submap = map
          .toKeyedSeq()
          .filter((v, kmap) => validKeys.every((v, k) => is(v, kmap.get(k))))
          .mapKeys(k => {
            return k
              .toKeyedSeq()
              .filterNot((v, k2) => validKeyNames.has(k2))
          })
          .toMap()
        const subKeyNames = keyNames.subtract(validKeyNames)

        if (subKeyNames.size === 1) {
          return submap.mapKeys(k => k.first())
        }
        return MultiKeyMap(subKeyNames, submap)
      }
    },
    set (keys, value) {
      this.map = this.map.set(IMap(keys), value)
      return this
    }
  }
}
