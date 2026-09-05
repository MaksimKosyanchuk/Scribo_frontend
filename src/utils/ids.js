const toId = (value) => (value == null ? "" : String(value))

const sameId = (a, b) => toId(a) === toId(b) && toId(a) !== ""

const hasId = (list = [], id) => list.some((item) => sameId(item, id))

const withId = (list = [], id) => (hasId(list, id) ? list : [...list, id])

const withoutId = (list = [], id) => list.filter((item) => !sameId(item, id))

const setIdPresent = (list = [], id, present) => (present ? withId(list, id) : withoutId(list, id))

export { toId, sameId, hasId, withId, withoutId, setIdPresent }
