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
 * @param {Array<import('acorn').Node>} result
 */

/**
 * Walk through ast object and return a list of Node that satisfy the requirement
 * @param {import('acorn').Node} node 
 * @param {PredicateCallback} predicate 
 * @param {PredicateCallback} earlyExitPredicate 
 */
module.exports = function (node, predicate, earlyExitPredicate) {
    if (earlyExitPredicate == null) {
        earlyExitPredicate = () => { return false }
    }
    let result = __Recurse(node, [], predicate, earlyExitPredicate)
    return result
}
/**
 * Recursively go through all node and return elements that match the predicate
 * @param {*} node 
 * @param {Array<import('acorn').Node>} ancestors 
 * @param {PredicateCallback} predicate 
 * @param {PredicateCallback} earlyExitPredicate 
 * @returns {Array<ResultEntry>}
 */
function __Recurse(node, ancestors, predicate, earlyExitPredicate) {

    let result = []
    if (typeof (node) != 'object') {
        return []
    }


    //anlyze current node
    let matchRequirement = predicate(node, ancestors)
    if (matchRequirement) {
        let resultEntry = new ResultEntry(node, ancestors)
        result = result.concat([resultEntry])
    }



    let nodeKyes = Object.keys(node)
    for (let i = 0; i < nodeKyes.length; i++) {
        //decide if we need to perform early exit
        let earlyExit = earlyExitPredicate(node, ancestors, result)
        if (earlyExit) {
            return result
        }

        let nodeIndex = nodeKyes[i]
        let currentNode = node[nodeIndex]
        let newAncestors = JSON.parse(JSON.stringify(ancestors))
        if (currentNode == null || currentNode.constructor == null || currentNode.constructor.name == 'String' || currentNode.constructor.name == 'Number') {
            continue
        }
        if (currentNode.constructor.name == "Node" || currentNode.type != null) {
            newAncestors.push(currentNode)
        }
        let currentOutput = __Recurse(currentNode, newAncestors, predicate, earlyExitPredicate)
        //add current result
        result = result.concat(currentOutput)
    }
    return result

}