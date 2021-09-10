class ResultEntry {
    /**
     * 
     * @param {import('acorn').Node} node 
     * @param {Array<import('acorn').Node>} ancestors 
     */
    constructor(node, ancestors) {
        this.node = node
        this.ancestors = ancestors
    }
}


/**
 * This is callback function for walk predicate
 *
 * @callback PredicateCallback
 * @param {import('acorn').Node} node
 * @param {Array<import('acorn').Node>} ancestors
 */

/**
 * Walk through ast object and return a list of Node that satisfy the requirement
 * @param {import('acorn').Node} node 
 * @param {PredicateCallback} predicate 
 */
module.exports = function (node, predicate) {
    let result = __Recurse(node, [], predicate)
    return result
}
/**
 * Recursively go through all node and return elements that match the predicate
 * @param {*} node 
 * @param {Array<import('acorn').Node>} ancestors 
 * @param {Function} predicate 
 * @returns {Array<ResultEntry>}
 */
function __Recurse(node, ancestors, predicate) {

    let result = []
    if (typeof (node) != 'object') {
        return []
    }

    let nodeKyes = Object.keys(node)


    for (let i = 0; i < nodeKyes.length; i++) {
        let nodeIndex = nodeKyes[i]
        let currentNode = node[nodeIndex]
        let newAncestors = JSON.parse(JSON.stringify(ancestors))
        if (currentNode.constructor.name == "Node") {
            newAncestors.push(currentNode)
        }


        let currentOutput = __Recurse(currentNode, newAncestors, predicate)
        result = result.concat(currentOutput)
    }
    let matchRequirement = predicate(node, ancestors)
    if (matchRequirement) {
        let resultEntry = new ResultEntry(node, ancestors)
        result = result.concat([resultEntry])
    }
    return result

}