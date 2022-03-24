/***********************************************These are the functions that assist the locator formation****************************************/

/**
* this function is used to find the text content of the target element (for multiple contents in tag, it will return all even if there is no text but only \n or \t)
* @parameter  target element
* **Be careful, this function so far does not support the case if content has ' or "
* return   the text content of target element (array)
*/

function getTagContent(targetElement){
	let childList = targetElement.childNodes
	let tagContent = []
	for(let i=0; i<childList.length; i++){
		if(childList[i].data != undefined){
            tagContent.push(childList[i].data)
		}
	}
	return tagContent
}


/**
* this function is used to find the xpath of the target element based on tag content, judge whether it is unique or not.
* @parameter  target element
* @parameter  tagContent   tag content array
* return   if using tag content to identify target element uniquely, then return the corresponding xpath, otherwise return null (meaning it is not unique)
*/

function createLocatorForTagContent(targetElement, tagContent){
    let tagName = targetElement.tagName
    let count = 0
    let xpath = ""
    let result

    if(tagContent.length == 0){
        xpath = `//${tagName}[.='']`  
    }else{
        for(let i = 0; i <tagContent.length; i++){
            if(i == 0){
                xpath = `text()='${tagContent[i]}'`
            }else{
                xpath = xpath + " and " + `text()='${tagContent[i]}'`
            } 
        }
        xpath = `//${tagName}[` + xpath + ']'
    } 

    
    result = document.evaluate(xpath,document)

    //judge if the result is one or multiple, only one is acceptable
    while(result.iterateNext() != null){
        count = count + 1 
    }

    if(count == 1){
        let locatorInfo = {"element":null, "uniqueAttributeName":null, "uniqueAttributePriority":null, "uniqueAttributeNumber":null, "levels": null, "locator":null, "group": null}
        locatorInfo.element = targetElement
        locatorInfo.uniqueAttributeName = "tagContent"
        locatorInfo.uniqueAttributeNumber = 1
        locatorInfo.levels = 1
        locatorInfo.locator = xpath
        locatorInfo.group = 1

        count = 0
        xpath = ""

        return locatorInfo
    }else{
        count = 0
        xpath = ""

        return null
    }
}


/**
*this function return the first attribute name in userPriority if it is found in target element
*@param userPriority is an array which has the collection of all user defined attributes priority, 0 has the top priority
*@param targetElement
*@param uniqueAttributesDic
*@return the top priority attribute name (string)
*/

function selectAttributeBasedOnUserPriority(targetElement, uniqueAttributesDic, userPriority){
    for(let i = 0; i<userPriority.length; i++){
        if(userPriority[i] in uniqueAttributesDic){
            return userPriority[i]
        }
    }
    return null
}


/**
* in this function, give a DOM element, find out if any attribute of this element is unique or not, so the element can be identified by this unique attribute
* the attributes are not include the combination case, tagName or tagContent so far, only support CSS type and customized type
* @param    targetElement is the DOM node
* @param    elementList is the list of all DOM nodes
* @param    returnType is to decide if you want to return just one attribute in priority or return all attributes collection (unique attribute: one or all, non unique attribute: nonUnique)
* @param    userPriority
* @return   the unique attribute name (string)
*/
function findElementUniqueAttribute(targetElement, elementList, returnType, userPriority){

	//retrieve all attributes from the element, including the customized one
	let attributesArr = targetElement.attributes
	//calculate how many attribute the element has
	let attributesLen = targetElement.attributes.length
	
	let attributeName
	let attributeValue
	

    //how many elements share one atrribute in same
	let elementCount = 0
    
    //this dictionary is used to store all unique attributes of the target element
    //another dictionary is used to store all non unique attributes of the target element
    let uniqueAttributesDic = new Array()
	let nonUniqueAttributesDic = new Array()

    let priorityAttribute
    
    //retrieve the tag content of target element
    let tagContent = getTagContent(targetElement)
	
	
    //choose each attribute and make judgement
	for(let i = 0; i < attributesArr.length; i++){
		attributeName = attributesArr[i].name
		attributeValue = attributesArr[i].value

	    //first, judge if other node has a same attribute name, if so, then judge if the attribute value is same or not, 
		for(let j = 0; j < elementList.length; j++){
            if(elementList[j].hasAttribute(`${attributeName}`) && elementList[j].getAttribute(`${attributeName}`) == attributeValue){
                elementCount++
                if(elementCount > 1){
                	nonUniqueAttributesDic[attributeName] = attributeValue
                	break
                }
            }
        }

        //if nodeCount is larger than 1, meaning this attribute is not unique, continue to next loop, reset nodeCount
        //otherwise the attribute must be unique, save it to the dictionary.
        if(elementCount != 1){
            elementCount = 0
            continue;
        }else{
            elementCount = 0
            uniqueAttributesDic[attributeName] = attributeValue
        }
	}

    //case 1. for the element with unique attribute, only needs first unique attribute, so return type is "one"
	if(returnType == "one"){
        //if no unique attribute found in element, then return null
    	if(Object.keys(uniqueAttributesDic).length == 0){
    		return null
    	}
        
        //if user priority is not empty, search any attribute found in user priority at first place, if not null, return that attribute name
        if(userPriority != null){
        	priorityAttribute = selectAttributeBasedOnUserPriority(targetElement, uniqueAttributesDic, userPriority)
			if(priorityAttribute != null){
				return priorityAttribute
			}
        }
        
        //in here, we want to give a priority of these unique attribute (suppose priorityAttribute is null)
	    //more rules could be added later.
	    if("id" in uniqueAttributesDic){
	        return "id"
	    }else if("class" in uniqueAttributesDic){
		    return "class"
	    }else{
	        //return the first key which includes the keyword "id"
	        let keyArr = Object.keys(uniqueAttributesDic)
	        for(let i = 0; i<keyArr.length; i++){
	            if(keyArr[i].includes("id")){
	                return keyArr[i]
	            }
	        }
		    return (Object.keys(uniqueAttributesDic)[0])
	    }
    	   
	}

    //case 2. for the target element with unique attributes, return all unique attributes, so return type is "all"
	if(returnType == "all"){
	    //if xpath of tag content does not return null (means search target element by tag content can be unique), then add "tagContent" to uniqueAttributesDic
        if(createLocatorForTagContent(targetElement, tagContent)!=null){
            uniqueAttributesDic["tagContent"] = createLocatorForTagContent(targetElement, tagContent)
        }

        //if no unique attribute found in element, then return null
    	if(Object.keys(uniqueAttributesDic).length == 0){
    		return null
    	}
	    return Object.keys(uniqueAttributesDic)
	}

    //case 3. for the target element without unique attributes, return all non unique attributes, so return type is "nonUnique"
	if(returnType == "nonUnique"){
        if(Object.keys(nonUniqueAttributesDic).length == 0){
    		return null
    	}
	    return Object.keys(nonUniqueAttributesDic)
	}
}


/**
* in this function, we want to find every element which has unique attribute (one here) in the DOM tree, so we can have all possible locators for target element.
* @param    elementList has all elements in the DOM tree
* @return   sourceElementList the array which has all unique elements collection, in the form of "element, uniqueAttributeName, uniqueAttributeValue" 
*/
function findElementListWithUniqueAttribute(elementList, userPriority){
   
    
    let uniqueAttributeSearchResult

    let sourceElementList = new Array()
   
    //search each node of DOM tree to collect the selector with unique attribute
    for(let i = 0; i<elementList.length; i++){
        uniqueAttributeSearchResult = findElementUniqueAttribute(elementList[i], elementList, "one", userPriority)
        let sourceElement = {"element": null, "uniqueAttributeName": null, "uniqueAttributeValue": null}
        
        //if we find such element, then we save it to the list, if not, move to the next element.
        if(uniqueAttributeSearchResult == null){
            continue;
        }else{
            sourceElement.element = elementList[i]
            sourceElement.uniqueAttributeName = uniqueAttributeSearchResult
            sourceElement.uniqueAttributeValue = elementList[i].getAttribute(uniqueAttributeSearchResult) 
        }
        sourceElementList.push(sourceElement)
    }

    return sourceElementList
}


/**
* in this function, we want to return the direct parent element of current element
* @parameter   element
* @return   direct parent element (element)
*/
function getParentElement(element){
    if(element.parentElement!=null){
        return element.parentElement
    }else{
        return null
    }
}

/**
* in this function, we want to find the common parent element of two element.
* @parameter   targetElement
* @parameter   elementWithUniqueAttribute
* @return   the common parent element (element)
*/
function commonParentNode(targetElement, elementWithUniqueAttribute) {
    
    //if one element is the parent (direct or non-direct) of the other element or reverse, then return this one or the other one.
    //if not, then compare the parent node of one element with the other element, recursion until find the common parent element at lowest level
    if(targetElement.contains(elementWithUniqueAttribute)) {
        return targetElement;
    }else if(elementWithUniqueAttribute.contains(targetElement)){
        return elementWithUniqueAttribute;
    }
    else {
        return commonParentNode(targetElement.parentElement,elementWithUniqueAttribute);
    }
}


/**
* in this function, form the xpath between two nodes using index (meaning, the elements inside range are not unique, we have to use index).
* @parameter   parentElement
* @parameter   targetElement
* @return   locator (dict)
*/
function xpathFormationUsingIndex(parentElement, targetElement){
    let childElement
    let childElementList
    let locator =""
    let levels = 0

    //if both elements are same (this is somehow not the case), then return null 
    if(parentElement.isEqualNode(targetElement)){
        return null
    }

    let element = parentElement
    //in the while loop, find the child element contains the target element first, then form the xpath for each level until reach the target element
    while(true){
        childElementList = element.children
        levels++
        for(let i = 0; i<childElementList.length; i++){
            if(childElementList[i].contains(targetElement)){
                locator = locator + `/*[${i+1}]`
                childElement = childElementList[i]
                break
            }
        }

        if(childElement.isEqualNode(targetElement)){
            break
        }else{
            element = childElement
        }
    }
    
    //return the locator and levels to reach target element
    return {locator, levels};
}


/**
* in this function, continue form the xpath between two nodes (multiple cases summary here).
* @parameter  targetElement
* @paremeter  commonParentElement
* @return locator (dict)
* 1. first, make judgement if target element can be unique inside the children list of common parent element,
* 2. if not, then find the nearest parent node with unique attribute to the target element in the parent bath between target element and common parent node.
* 3. if it is found, then judge the target element is unique inside all children of nearest parent element.
         if yes, then common parent element -> parent node -> target element (all direct),
         if no, then common parent element -> parent node -> target element (direct + index) 
* 4. if not found, xpath with index from common parent node to target element, 
* 5. the idea for this method is to reduce the range of child nodes by having a lower parent node to find that target element is unique or not
*/

function pathBetweenTwoNodes(targetElement, commonParentElement, userPriority){
    let elementName
    let uniqueAttributeName
    let uniqueAttributeValue

    let uniqueAttributeSearchResult
    let allChildNodes
    let element
    let results
    let locator = ""
    let levels
    let nearestParentElement = {"element":null,"uniqueAttributeName":null}
    
    //if both elements are same (this is somehow not the case), then return null 
    if(targetElement.isEqualNode(commonParentElement)){
        return null
    }

    //first, judge if the target element can be directly found from the common parent node
    allChildNodes = commonParentElement.getElementsByTagName('*')

    uniqueAttributeSearchResult = findElementUniqueAttribute(targetElement, allChildNodes, "one", userPriority)

    if(uniqueAttributeSearchResult!=null){
        elementName = targetElement.tagName
        uniqueAttributeName = uniqueAttributeSearchResult
        uniqueAttributeValue = targetElement.getAttribute(uniqueAttributeName)

        //locator here directly referred to the target selector
        locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']`
        levels = 1
    }else{
        //if not, then find the nearest parent node with unique attribute between common parent node and target element
        //store this nearest parent element information 
        allChildNodes = commonParentElement.getElementsByTagName('*')

        element = targetElement.parentElement

        while(true){
            if(element.isEqualNode(commonParentElement)){
                break
            }

            uniqueAttributeSearchResult = findElementUniqueAttribute(element, allChildNodes, "one", userPriority)

            if(uniqueAttributeSearchResult!=null){
                nearestParentElement.element = element
                nearestParentElement.uniqueAttributeName = uniqueAttributeSearchResult
                break
            }else{
                element = element.parentElement
            }
        }

        //if we can not find it, meaning all parent node and target element are not unique, then use the xpath with index to locate the target selector
        //may consider the parent node combninatin later on
        if(nearestParentElement.element == null){

            //locator here referred to target selector by xpath with index, for most cases, this is rare happened, especially, if there is a long parent path 
            results = xpathFormationUsingIndex(commonParentElement, targetElement)
            locator = results.locator
            levels = results.levels
        }else{
            // if there is, then judge the target selector inside the child list of nearest parent node is unique or not.
            allChildNodes = nearestParentElement.element.getElementsByTagName('*')

            uniqueAttributeSearchResult = findElementUniqueAttribute(targetElement, allChildNodes, "one", userPriority)
            
            //if not, then from the nearest parent node to target element, we have to use xpath with index
            if(uniqueAttributeSearchResult == null){
                results= xpathFormationUsingIndex(nearestParentElement.element, targetElement)
                locator = results.locator
                levels = results.levels
            }else{
                elementName = targetElement.tagName
                uniqueAttributeName = uniqueAttributeSearchResult
                uniqueAttributeValue = targetElement.getAttribute(uniqueAttributeName)
                locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']`
                levels = 1
            }
            
            elementName = nearestParentElement.element.tagName
            uniqueAttributeName = nearestParentElement.uniqueAttributeName
            uniqueAttributeValue = nearestParentElement.element.getAttribute(uniqueAttributeName)

            //in here, the xpath from common parent node to nearest parent node, then to locator.
            locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']` + locator
            levels = levels + 1
        }
    }
    
    //continue return the locator and levels to reach target element
    return {locator, levels};
}

/**
* in this function, account how many levels between two nodes (common parent element and element with unique attribute)
* @parameter   elementWithUniqueAttribute
* @parameter   commonParentElement 
* @return   count number (number) 
*/
function findLevelsBetweenTwoNodes(elementWithUniqueAttribute, commonParentElement){
    let element = elementWithUniqueAttribute
    let count = 0

    while(true){
        if(element.isEqualNode(commonParentElement)){
            break
        }else{
            count++
            element = element.parentElement
        }
    }

    return count
}


/************************************These four functions is to find the nonUnique attributes combinations for xpath of target element*************************************/


/**
* this function is to find nont unique attributes combination of the target element, the attributes number is in range between 2 and attribtues length.
* @parameter  attributeArr, all attribtues collection (including the tag content, even if it is empty, in here we assume the )
* @parameter  combinationSize, the size of combination (variable from 2 to attributes length), the attributes combination size will be at least 2
* return combinationsArray (array)
*/

function attributeCombination(attributeArr,combinationSize){	
	//define a combinationsArray to store the combinations
    let combinationsArray = []
	
	//selectedArr has the element in selection
    function combine(selectedArr,attributeArr,combinationSize){
        //if combinationSize == 0，then one combiantion is done，save the result into combinationsArray
        if(combinationSize == 0){
            combinationsArray.push(selectedArr)
            return
        }
        //loop all elements，loop number is equal to combinationSize-1
        for(let i = 0;i<attributeArr.length-(combinationSize-1);i++){
            let tempArr = selectedArr.slice()
            tempArr.push(attributeArr[i])
            combine(tempArr,attributeArr.slice(i+1),combinationSize-1)
        }
    }

    combine([], attributeArr, combinationSize);
    return combinationsArray;
}


/**
* this function receives the attributesCombinationsList and return a list which has those non unique attributes combinations 
* that can uniquely identify the element
* @parameter targetElement
* @parameter attributesCombinationsList
* return locatorSummary (array)
*/
function validateXpathAttributesCombinations(targetElement, attributesCombinationsList){
    let count = 0
    let result
    let tagName = targetElement.tagName
    let tagContent = getTagContent(targetElement)
    let attributesCombinationsResult = []

    let xpath = ""
    let attributeName
    let attributeValue
    let element
    let locatorSummary = []

    for(let i = 0; i<attributesCombinationsList.length; i++){
        //this case, if attributeCombinationList only has one element, and that element is tagContent, means no nonUnique attribute are found
        if(attributesCombinationsList[i].length == 1 && attributesCombinationsList[i][0] == "tagContent"){
			//if tagContent length is 0, means no content at all, must use .=, e.g. <a class="class"></a>, .=''
            if(tagContent.length == 0){
				xpath = `//${tagName}[.='']`  
            //if not, then may be two cases, one is multiple contents and none of them are empty, the other case is multiple contents and some of them are empty, use text()= for all
			}else{
				for(let j = 0; j <tagContent.length; j++){
					if(j == 0){
						xpath = `text()='${tagContent[j]}'`
	                }else{
	                    xpath = xpath + " and " + `text()='${tagContent[j]}'`
	                } 
				}
				xpath = `//${tagName}[` + xpath + ']'
			} 
        }else{
            //same happened if attributesCombinationsList length is not equal to 1, seperate by tagContent length to decide use .= or text()=
            for(let j = 0; j<attributesCombinationsList[i].length; j++){
                if(attributesCombinationsList[i][j] == "tagContent"){
					if(tagContent.length == 0){
						if(j == 0){
                            xpath = `.=''`
			            }else{
			                xpath = xpath + " and " + `.=''`
			            } 
					}else{
                        if(j == 0){
                            for(let k = 0; k <tagContent.length; k++){
    							if(k == 0){
    				                xpath = `text()='${tagContent[k]}'`
    			                }else{
    			                    xpath = xpath + " and " + `text()='${tagContent[k]}'`
    			                } 
    						}
                        }else{
                            for(let k = 0; k <tagContent.length; k++){
    			                xpath = xpath + " and " + `text()='${tagContent[k]}'`
    						}
                        }
					} 
                }else{
                    attributeName = attributesCombinationsList[i][j]
                    attributeValue = targetElement.getAttribute(attributeName)
                    if(j == 0){
                         xpath = `@${attributeName}='${attributeValue}'`
                    }else{
                         xpath = xpath + " and " + `@${attributeName}='${attributeValue}'`
                    } 
                }
            }
            xpath = `//${tagName}[` + xpath + ']'
        }
        
        result = document.evaluate(xpath,document)

        //judge if the result is one or multiple, only one is acceptable
        while(result.iterateNext() != null){
            count = count + 1 
        }

        if(count == 1){
            let locatorInfo = {"element":null, "nonUniqueAttributeName":null, "nonUniqueAttributePriority":null, "nonUniqueAttributeNumber":null, "levels": null, "locator":null, "group": null}
            locatorInfo.element = targetElement
            locatorInfo.nonUniqueAttributeName = attributesCombinationsList[i]
            locatorInfo.nonUniqueAttributeNumber = attributesCombinationsList[i].length
            locatorInfo.levels = 1
            locatorInfo.locator = xpath
            locatorInfo.group = 2
            locatorSummary.push(locatorInfo)
        }
        count = 0
        xpath = ""
    }

    return locatorSummary
}

/**
* this function receives the element list from DOM tree, find all non unique attributes combinations to identify target element uniquely and return the locator summary we want. 
* @parameter targetElement
* @parameter elementList
* return locatorSummary (array)
*/
function findAllAttributesCombination(targetElement, elementList, userPriority){
    let attributesCombinations = []
    let attributesCombinationsList = []
    let locatorSummary

    let attributeCount = 0
    let elementCount = 0
    let attributeName
    let attributeValue

    let locator = ""
    let elementName
    let elementText
    let count = 0

    let attributesCombinationsResult = new Array()

    let nonUniqueAttributeSearchResult = findElementUniqueAttribute(targetElement, elementList, "nonUnique", userPriority)
    
    //setp 1. collect all non unique attributes of target element, including tag content
    if(nonUniqueAttributeSearchResult != null && nonUniqueAttributeSearchResult.length != 0){
        nonUniqueAttributeSearchResult.push("tagContent")

        //step 2. find all combinations of these attributes
		for(let i = 2; i <= nonUniqueAttributeSearchResult.length; i++){
            attributesCombinations = attributeCombination(nonUniqueAttributeSearchResult, i)
            for(let j = 0; j < attributesCombinations.length; j++){
                attributesCombinationsList.push(attributesCombinations[j])
            }
        }
    }else{
        attributesCombinationsList.push(["tagContent"])
    }

    //step 3. filtering these combinations to see any one is unique, then form the locator for target element
    locatorSummary = validateXpathAttributesCombinations(targetElement, attributesCombinationsList)
    
    return locatorSummary
}


/******************************************************These two functions is to sort the locator priority*************************************************/

/**
* this function is to sort the locator attributes
* @parameter    locator_a
* @paremeter   locator_b
* @return   0 or 1 or -1 (number)
* 1. the priority may be changed, in here is levels > groups > uniqueAttributeNumber (nonUniqueAttributeNumber) > uniqueAttributePriority (nonUniqueAttributePriority)
*/

function sortLocator(locator_a, locator_b) { 
    if (locator_a.levels == locator_b.levels) {
        if (locator_a.group > locator_b.group) {
            return 1
        } else if (locator_a.group < locator_b.group) {
            return -1
        } else {
            // group == 2 means nonUniqueAttribute in target element, group == 6 means nonUniqueAttribute in multi element, other groups means uniqueAttribute
            if(locator_a.group == 2 || locator_a.group == 6){
                if (locator_a.nonUniqueAttributeNumber > locator_b.nonUniqueAttributeNumber) {
                    return 1
                } else if (locator_a.nonUniqueAttributeNumber < locator_b.nonUniqueAttributeNumber) {
                    return -1
                } else {
                    if (locator_a.nonUniqueAttributePriority > locator_b.nonUniqueAttributePriority) {
                        return 1
                    } else if (locator_a.nonUniqueAttributePriority < locator_b.nonUniqueAttributePriority) {
                        return -1
                    } else {
                        return 0
                    }
                }
            }else{
                if (locator_a.uniqueAttributeNumber > locator_b.uniqueAttributeNumber) {
                    return 1
                } else if (locator_a.uniqueAttributeNumber < locator_b.uniqueAttributeNumber) {
                    return -1
                } else {
                    if (locator_a.uniqueAttributePriority > locator_b.uniqueAttributePriority) {
                        return 1
                    } else if (locator_a.uniqueAttributePriority < locator_b.uniqueAttributePriority) {
                        return -1
                    } else {
                        return 0
                    }
                }
            }
        }
    } else {
        return locator_a.levels > locator_b.levels ? 1 : -1
    }
}

/**
* this function is to give a priority of the locator list
* @parameter    targetElement
* @paremeter   locatorList
* @parameter   userPriority
* @return   locatorList with priority setup (array)
* 1.  based on the user priority list, we set up the weight of uniqueAttributePriority/nonUniqueAttributePriority of every locator, 
*/
function createLocatorListWithPriority(targetElement, locatorList, userPriority){
    for(let i = 0; i<locatorList.length; i++){
        let flag = 0
        let count = 0
        let locator = locatorList[i]
        
    	if("uniqueAttributeName" in locator){
            //find if the uniqueAttributeName of locator is in the userPriority.
            //if so, then assign the weight
            for(let j = 0; j<userPriority.length; j++){
                if(locator["uniqueAttributeName"] == userPriority[j]){
                    locator["uniqueAttributePriority"] = j
                    flag = 1
                    break
                }
            }

            //if flag == 0, means the uniqueAttributeName is not in the userPriority, then give larger wieght.
            //id and class are two special case, id always better than class
            if(flag == 0){
                if(locator['uniqueAttributeName'] == "id"){
            		locator['uniqueAttributePriority'] = userPriority.length
            	}else if(locator['uniqueAttributeName'] == "class"){
            		locator['uniqueAttributePriority'] = userPriority.length + 1
            	}else {
            		locator['uniqueAttributePriority'] = userPriority.length + 2
            	}
            }else{
                flag = 0
            }
        }else{
            if(locator['group'] == 2){
                //if it is nonUniqueAttribute, then we use a count variable to sum up all weight, then assign to the nonUniqueAttributePriority
                for(let j = 0; j<locator['nonUniqueAttributeName'].length; j++){
                    for(let k = 0; k<userPriority.length; k++){
                        if(locator['nonUniqueAttributeName'][j] == userPriority[k]){
                            count = count + k
                            flag = 1
                            break
                        }
                    }
                    
                    if(flag == 0){
                        count = count + userPriority.length
                    }else{
                        flag = 0
                    }
                } 
    
                locator['nonUniqueAttributePriority'] = count
                count = 0
            }

            if(locator['group'] == 6){
                for(let j = 0; j < locator['nonUniqueAttributeName'].length; j++){
                    for(let k = 0; k < locator['nonUniqueAttributeName'][j].length; k++){
                        for(let l = 0; l < userPriority.length; l++){
                            if(locator['nonUniqueAttributeName'][j][k] == userPriority[l]){
                                count = count + l
                                flag = 1
                                break
                            }
                        }

                        if(flag == 0){
                            count = count + userPriority.length
                        }else{
                            flag = 0
                        }
                    }
                }

                locator['nonUniqueAttributePriority'] = count
                count = 0
            }
        }
    }

    //do the sorting.
    locatorList.sort(sortLocator)

    return locatorList
}


/**
* This function continue filtering the locator list with user Priority
* @paremeter   locatorList
* @parameter   userPriority
* @return   locatorList with further filtering result
* 1.  put some lcoator of group 6 to the front of list, these locators attributes length is same to userPriority length and names are same
*/
function furtherFilteringLocatorListWithUserPriority(locatorList, userPriority){
    let locator
    let locatorTemp
    let flag = 0
    let index = 0
	let weights = 0
	
	for(let i = 0; i< locatorList.length; i++){
        locator = locatorList[i]
        
        if("nonUniqueAttributeName" in locator && locator['group'] == 6 && locator['nonUniqueAttributeNumber'] <= userPriority.length){
            for(let j = 0; j < locator["nonUniqueAttributeName"].length; j++){
                for(let k = 0; k < locator["nonUniqueAttributeName"][j].length; k++){
                    if(userPriority.indexOf(locator["nonUniqueAttributeName"][j][k]) != -1){
                        continue
                    }else{
                        flag = 1
                        break
                    }
                }

                if(flag == 1){
                    break
                }else{
                    continue
                }
            }

            if(flag == 0){
                locatorTemp = locatorList.splice(i,1)
                locatorList.splice(index,0,locatorTemp[0])
                index = index + 1
            }else{
                flag = 0
            }
        }
    }

    return locatorList
}


/**
* this function is to sort the locator by weights attribute value
* @parameter    locator_a
* @paremeter   locator_b
* @return   0 or 1 or -1 (number)
*/

function sortLocatorByWeights(locator_a, locator_b) {
    if(locator_a.weights == locator_b.weights){
        return 0
    } else {
        return locator_a.weights > locator_b.weights ? 1 : -1
    }
}


/**
* this function is to split the locator list, filtering the new list by weights attribute values and merge the list together
* @parameter    locatorList   original locator list
* @paremeter   userPriority   user priority array
* @parameter   k_1 and k_2   the coefficients to calculate the final weights value
* @return   newLocatorList
*/

function splitLocatorListAndFilteringByWeights(locatorList, userPriority, k_1, k_2){
    let count = 0
    let result = null
    let indexArr = []
    let weights = 0
    let locator
    let flag = 0
    let newLocatorList = []

    for(let i = 0; i<locatorList.length; i++){
        locator = locatorList[i]
        if("nonUniqueAttributeName" in locator){
            if(locator['group'] == 6){
                for(let j = 0; j < locator["nonUniqueAttributeName"].length; j++){
                    for(let k = 0; k < locator["nonUniqueAttributeName"][j].length; k++){
                        if(userPriority.indexOf(locator["nonUniqueAttributeName"][j][k]) != -1){
                            weights = weights + userPriority.indexOf(locator["nonUniqueAttributeName"][j][k])
                            continue
                        }else{
                            flag = 1
                            break
                        }
                    }
    
                    if(flag == 1){
                        break
                    }else{
                        continue
                    }
                }

                if(flag == 0){
                    locator["weights"] = weights * k_1 + locator["levels"] * k_2
                    indexArr.push(i)
                }else{
                    flag = 0
                }
            }else{
                for(let j = 0; j < locator["nonUniqueAttributeName"].length; j++){
                    if(userPriority.indexOf(locator["nonUniqueAttributeName"][j]) != -1){
                        weights = weights + userPriority.indexOf(locator["nonUniqueAttributeName"][j])
                        continue
                    }else{
                        flag = 1
                        break
                    }
                }

                if(flag == 0){
                    locator["weights"] = weights * k_1 + locator["levels"] * k_2
                    indexArr.push(i)
                }else{
                    flag = 0
                }
            }
        }else{
            if(locator['group'] == 1){
                if(userPriority.indexOf(locator["uniqueAttributeName"]) != -1){
                    weights = weights + userPriority.indexOf(locator["uniqueAttributeName"])
                    locator["weights"] = weights * k_1 + locator["levels"] * k_2
                    indexArr.push(i)
                }
            }
        }
    }

    if(indexArr.length != 0){
        for(let i = indexArr.length - 1; i >= 0; i--){
            locator = locatorList.splice(indexArr[i],1)
            newLocatorList.unshift(locator[0])
        }
    }

    //do the sorting by weights.
    newLocatorList.sort(sortLocatorByWeights)

    //concat two array together
    newLocatorList = newLocatorList.concat(locatorList)
    
    return newLocatorList

}

/****************************************************This function is used to validate the locator xpath***********************************************/
/**
* this function is to validate the xpath of each locator, if nothing wrong, it will return 0
* @parameter    targetElement
* @paremeter   locatorList
* @return   issueCount (number)
* 1. use try-catch or logging to save the problem information.
*/

function evaluateXpathForTargetSelector(targetElement, locatorList){
    let result
    let element
    let problemCount = 0

    for(let i = 0; i<locatorList.length; i++){
        result = document.evaluate(locatorList[i].locator, document);

        if(result == null){
            console.log("Result is null -------------- " + locatorList[i].element)
            problemCount++
            continue
        }else{
            element = result.iterateNext()
            if(element.isEqualNode(targetElement)){
                continue
            }else{
                console.log("Multiple results found ------------- " + locatorList[i].element)
                problemCount++
                continue
            }
        }
    }

    return problemCount 
} 


/*********************** This program can give the xpath which has multiple elements with multiple attributes ***********************/
/**
* reference link: https://bbs.csdn.net/topics/391998625
* The program running logic is following this way:
* program starts from function: 
*     locatorSummaryByMultiElemsMultiAttrs(targetElement, userPriority) ------->  locatorSummaryAfterFiltering
*         step 1. createFinalXpathListForTargetSelector (element, userPriority)  ------>  elementsCombinationsFinal
*                     attributesCombinationForMultipleElements (element, userPriority)  ----->   elementsCombinationsXpathList
*                         findAttributesInElement (element, userPriority)  ------>   attributesInElement
*                         attributeCombination (attributeArr,combinationSize)  ----->    combinationsArray
*                         formXpathForAttributesCombinations (element, attributesCombinations)  ------>  attributesCombinationsXpathSummary
*                             getTagContent (element)  ------>   tagContent
*         step 2. furtherCombineAllPossibleXpath (elementsCombinationsFinal) ------->  locatorSummary
*                     createPermutationInArrays (elementsCombinationsFinal)  ------>   xpathCollectionFinal
*         step 3. filterXpathInLocatorSummary(targetElement, locatorSummary) ------->   locatorSummary
*         step 4. locatorSummary can be loaded to the main program
*/

/***************************************************** Step 1 *************************************************************/
/**
* This function is used to find any attribute of one element is belonging to the userPriority
* @parameter   element   the element which wants to be checked
* @parameter  userPriority   the user priority that user provided, it has format such as ["class","id"]
* @status  accessory function 1  (done in testing)
* @return  attributesInElement   this is an array includes the element attributes which is found in user priority
*/
function findAttributesInElement(element, userPriority){
    let attributesInElement = []

    if(userPriority.length == 0){
        return attributesInElement
    }else{
        for(let i = 0; i<userPriority.length; i++){
			if(userPriority[i] == "tagContent"){
                attributesInElement.push("tagContent")
            }else{
                if(element.hasAttribute(userPriority[i])){
                    attributesInElement.push(userPriority[i])
                }else{
                    continue
                }
            }
        }
        return attributesInElement
    }
}


/**
* This function is used to create the xpath based on the attributes combination of one element
* @parameter   element   the element which wants to be checked
* @parameter  attributesCombinations   the attribtues combinations array created from attributeCombination(attributeArr,combinationSize)
* @status  main function 1  (done in testing)
* @return  attributesCombinationsXpathSummary   this is a dict includes the element info and all xpath of attribtues combiatnon in "attributesCombinationsXpath"
*/
function formXpathForAttributesCombinations(element, attributesCombinations){
    let xpathForAttributesCombination = []
    let tagName = element.tagName
    let tagContent = getTagContent(element)

    let attributeName
    let attributeValue
    let xpath = ""

    let attributesCombinationsXpath = []
    let attributesCombinationsXpathSummary = {"element": null, "attributesCombinationsXpath":null}

    for(let i = 0; i < attributesCombinations.length; i++){
        for(let j = 0; j < attributesCombinations[i].length; j++){
			if(attributesCombinations[i][j] == "tagContent"){
                if(tagContent.length == 0){
                    if(j == 0){
                        xpath = `.=''`
                    }else{
                        xpath = xpath + " and " + `.=''`
                    }  
                }else{
                    if(j == 0){
                        for(let k = 0; k <tagContent.length; k++){
                            if(k == 0){
                                xpath = `text()='${tagContent[k]}'`
                            }else{
                                xpath = xpath + " and " + `text()='${tagContent[k]}'`
                            } 
                        }
                    }else{
                        for(let k = 0; k <tagContent.length; k++){
                            xpath = xpath + " and " + `text()='${tagContent[k]}'`
                        }
                    }
                    
                } 
            }else{
                attributeName = attributesCombinations[i][j]
                attributeValue = element.getAttribute(attributeName)
                if(j == 0){
                     xpath = `@${attributeName}='${attributeValue}'`
                }else{
                     xpath = xpath + " and " + `@${attributeName}='${attributeValue}'`
                }
            }
        }

        xpath = `//${tagName}[` + xpath + ']'
        let xpathInfo = {"nonUniqueAttributeName": null, "xpath": null}
        xpathInfo.nonUniqueAttributeName = attributesCombinations[i]
        xpathInfo.xpath = xpath
        attributesCombinationsXpath.push(xpathInfo)
        xpath = ""
    }

    attributesCombinationsXpathSummary.element = element
    attributesCombinationsXpathSummary.attributesCombinationsXpath = attributesCombinationsXpath

    return attributesCombinationsXpathSummary
}


/**
* This function is used to summary all potential xpath based on different attributes combination of elements (from target element and its parent elements).
* @parameter   element   the element which wants to be checked
* @parameter  userPriority   the user priority that user provided, it has format such as ["class","id"]
* @status  main function 2  (done in testing)
* @return  elementsCombinationsXpathList   this is a array includes all potential xpaths from target element ti its parents' elements.
*/
function attributesCombinationForMultipleElements(element, userPriority){
    let attributesInElement
    let attributesCombinations
    let attributesCombinationsXpathTemp
    let attributesCombinationsXpathFinal
    let elementsCombinationsXpathList = []

    while(element!=null){
        attributesInElement = findAttributesInElement(element, userPriority)

        if(attributesInElement.length == 0){
            element = element.parentElement
            continue
        }
        
        for(let i = 1; i <= attributesInElement.length; i++){
            attributesCombinations = attributeCombination(attributesInElement, i)
            
            if(i == 1){
                attributesCombinationsXpathFinal = formXpathForAttributesCombinations(element, attributesCombinations)
            }else{
                attributesCombinationsXpathTemp = formXpathForAttributesCombinations(element, attributesCombinations)
                for(let j = 0; j<attributesCombinationsXpathTemp.attributesCombinationsXpath.length; j++){
                    attributesCombinationsXpathFinal.attributesCombinationsXpath.push(attributesCombinationsXpathTemp.attributesCombinationsXpath[j])
                }
            }
        }
        
        elementsCombinationsXpathList.push(attributesCombinationsXpathFinal)
        element = element.parentElement
    }

    return elementsCombinationsXpathList
}


/**
* This function is used to create the final xpath list(from target element and its parent elements).
* @parameter   element   the element which wants to be checked
* @parameter  userPriority   the user priority that user provided, it has format such as ["class","id"]
* @status  main function 3  (done in testing)
* @return  elementsCombinationsFinal   return the final xpaths collection for all possible, including those ones may not working
*/
function createFinalXpathListForTargetSelector(element, userPriority){
    let elementsCombinationsXpathList = attributesCombinationForMultipleElements(element, userPriority)
    let elementsCombinations
    let elementsCombinationsFinalTemp = []
    let elementsCombinationsFinal = []

    if(elementsCombinationsXpathList.length == 0){
        return elementsCombinationsFinal
    }else if(elementsCombinationsXpathList.length == 1){
        elementsCombinationsFinalTemp.push(elementsCombinationsXpathList[0])
        elementsCombinationsFinal.push(elementsCombinationsFinalTemp)
        return elementsCombinationsFinal
    }else{
        let targetElementXpathInfo = elementsCombinationsXpathList.slice(0, 1)
        let remainElementsXpathInfo = elementsCombinationsXpathList.slice(1, elementsCombinationsXpathList.length)

		//limit the permutation number to 3 elements for one time at most
		for(let i = 1; i <= 2; i++){
            elementsCombinations = attributeCombination(remainElementsXpathInfo, i)
            for(let j = 0; j < elementsCombinations.length; j++){
                elementsCombinationsFinal.push(elementsCombinations[j])
            }
        }

        for(let i = 0; i<elementsCombinationsFinal.length; i++){
            elementsCombinationsFinal[i].unshift(targetElementXpathInfo[0])
        }

        //console.log(elementsCombinationsFinal)
        return elementsCombinationsFinal
    }
}


/***************************************************** Step 2 ***********************************************************/

/**
* This function is used to create the permutation of elements (target element and its all parent elements).
* @parameter   elementsCombinationsFinal   the final xpaths collection for all possible, including those ones may not working
* @status  main function 4  (done in testing)
* @case  consider the case if both element and parent element has the same attribute name and value.
* @return  xpathCollectionFinal   reorganize the xpath collections and output it
*/
function createPermutationInArrays(elementsCombinationsFinal){

    let xpathCollection = []
    let xpathCollectionTemp = []
    let xpathCollectionFinal = []
    
    for(let i = 0; i<elementsCombinationsFinal.length; i++){
        let xpathArr= new Array();
        
        for(let j = 0; j<elementsCombinationsFinal[i].length; j++){
            xpathArr.push(elementsCombinationsFinal[i][j]["attributesCombinationsXpath"]);
        }
        
        let result = []

        let count = 1
        function permutation(xpathArr, count){
            let len = xpathArr.length
        
            if(len >= 2){
                let len_1 = xpathArr[0].length
                let len_2 = xpathArr[1].length
        
                let totalLen = len_1 * len_2
                let tempArrSum = new Array(totalLen)

                let index = 0
                    
                for(let i = 0; i<len_1; i++){
                    for(let j=0; j<len_2; j++){                  
                        let tempArr= []
                        tempArr.push(xpathArr[0][i])
                        if(Array.isArray(tempArr[0])){
                            tempArr[0].push(xpathArr[1][j])
                            tempArrSum[index] = tempArr[0]
                        }else{
                            tempArr.push(xpathArr[1][j])
                            tempArrSum[index] = tempArr
                        }
                        index++
                    }
                }
        
                let newArr= new Array(len - 1)
                for(var k=2; k<xpathArr.length; k++){
                    newArr[k-1] = xpathArr[k]
                }
                
                newArr[0] = tempArrSum
                count = count + 1
                
                return permutation(newArr, count)
            }else{
                if(count == 1){
                    return xpathArr
                }else{
                    return xpathArr[0]
                }
            }
        }

        result = permutation(xpathArr, count)

        xpathCollection.push(result)
    }
    
    //console.log(xpathCollection)

    for(let i = 0; i<xpathCollection.length; i++){
        for(let j = 0; j<xpathCollection[i].length; j++){
            let elementInfo = {"element": null, "attributesCombinationsXpath":null}
            let xpathInfo = {"nonUniqueAttributeName":null, "xpath":null}
            let nonUniqueAttributeName = []
            let xpath = ""
            
            for(let k = 0; k<xpathCollection[i][j].length; k++){
                nonUniqueAttributeName.push(xpathCollection[i][j][k]["nonUniqueAttributeName"])
                xpath = xpathCollection[i][j][k]["xpath"] + xpath
            }

            xpathInfo.nonUniqueAttributeName = nonUniqueAttributeName
            xpathInfo.xpath = xpath

            elementInfo.element = elementsCombinationsFinal[i][elementsCombinationsFinal[i].length - 1]["element"]
            elementInfo.attributesCombinationsXpath = xpathInfo
            xpathCollectionFinal.push(elementInfo)
        }
    }

    //console.log(xpathCollectionFinal)
    
    return xpathCollectionFinal
}


/**
* This function is used to summary all xpath into the locator summary with a compatible format with the main program.
* @parameter   elementsCombinationsFinal   the final xpaths collection for all possible, including those ones may not working
* @status  main function 5  (done in testing)
* @return  locatorSummary   the locator summary has all locator information.
*/
function furtherCombineAllPossibleXpath(elementsCombinationsFinal){
    let locatorSummary = []
    let xpathCollectionFinal

    if(elementsCombinationsFinal.length == 0){
        return locatorSummary
    }else{
        xpathCollectionFinal = createPermutationInArrays(elementsCombinationsFinal)
        for(let i = 0; i < xpathCollectionFinal.length; i++){
            let locatorInfo = {"element":null, "nonUniqueAttributeName":null, "nonUniqueAttributePriority":null, "nonUniqueAttributeNumber":null, "levels": null, "locator":null, "group": null}
            locatorInfo.element = xpathCollectionFinal[i]["element"]
            locatorInfo.nonUniqueAttributeName = xpathCollectionFinal[i]["attributesCombinationsXpath"]["nonUniqueAttributeName"]
            let totalLength = 0
            for(let j = 0; j < xpathCollectionFinal[i]["attributesCombinationsXpath"]["nonUniqueAttributeName"].length; j++){
                totalLength = totalLength + xpathCollectionFinal[i]["attributesCombinationsXpath"]["nonUniqueAttributeName"][j].length
            }
            locatorInfo.nonUniqueAttributeNumber = totalLength
            locatorInfo.levels = xpathCollectionFinal[i]["attributesCombinationsXpath"]["nonUniqueAttributeName"].length
            locatorInfo.locator = xpathCollectionFinal[i]["attributesCombinationsXpath"]["xpath"]
            locatorInfo.group = 6
            locatorSummary.push(locatorInfo)
            totalLength = 0
        }

        return locatorSummary
    }
}

/***************************************************** Step 3 ***********************************************************/

/**
* This function is used to filtering the xpath to have the right ones as output, exclude the ones without single result, exclude the ones that is not target element
* @parameter   elementsCombinationsFinal   the final xpaths collection for all possible, including those ones may not working
* @status  main function 6  (done in testing)
* @return  locatorSummary   the locator summary has all correct locator information.
*/
function filterXpathInLocatorSummary(targetElement, locatorSummary){
    let count = 0
    let result = null
    let indexArr = []

    if(locatorSummary.length == 0){
        return locatorSummary
    }
    
    for(let i = 0; i<locatorSummary.length; i++){
        result = document.evaluate(locatorSummary[i]["locator"], document.cloneNode(true))
        
        //judge if the result is one or multiple, only one is acceptable
        while(result.iterateNext() != null){
            count = count + 1 
        }
    
        if(count == 1){
            result = document.evaluate(locatorSummary[i]["locator"], document.cloneNode(true))
            if(result.iterateNext().isEqualNode(targetElement)){
                count = 0
                result = null
                continue
            }else{
                indexArr.push(i)
            }
        }else{
            indexArr.push(i)
        }
        
        count = 0
        result = null
    }

    //console.log(indexArr)

    if(indexArr.length == 0){
        return locatorSummary
    }else{
        for(let i = indexArr.length - 1; i >= 0; i--){
            locatorSummary.splice(indexArr[i],1)
        }
        return locatorSummary
    }
}

/***************************************************** Step 4 ***********************************************************/


/**
This function is the final one to have all functions above and output the correct locator summary results.
* @parameter   targetElement   the element that wants to have the xpath
* @parameter   userPriority    the user priority that includes the priority attribtues
* @status  main function final (done in testing)
* @return  locatorSummaryAfterFiltering   the locator summary has all correct locator information.
*/

function locatorSummaryByMultiElemsMultiAttrs(targetElement, userPriority){
    let elementsCombinationsFinal
    let locatorSummary
    
    elementsCombinationsFinal = createFinalXpathListForTargetSelector(targetElement, userPriority)
    locatorSummary = furtherCombineAllPossibleXpath(elementsCombinationsFinal)
    locatorSummaryAfterFiltering = filterXpathInLocatorSummary(targetElement, locatorSummary)

    return locatorSummaryAfterFiltering
}



/*************************************************************This is the main function to find robust locators of target element************************************************/

/**
* The program running logic is following this way:
* program starts from function:
*     findRobustLocatorForSelector(elementSelected, userPriority) ------->  locatorSummary
*          step 1. findElementUniqueAttribute(targetElement, elementList, "all", userPriority)  ------->  uniqueAttributeSearchResult
*                      getTagContent(targetElement) ------> tagContent     
*                      priorityAttribute = selectAttributeBasedOnUserPriority(targetElement, uniqueAttributesDic, userPriority) ------>  priorityAttribute
*                      createLocatorForTagContent(targetElement, tagContent) ------>  locatorInfo
*          step 2. unique case:
*                      createLocatorForTagContent(targetElement, tagContent) ------> locatorInfo
*          step 3. non-unique case:
*                      findElementListWithUniqueAttribute(elementList, userPriority) ------> elementListWithUniqueAttribute
*                          findElementUniqueAttribute(targetElement, elementList, "one", userPriority)  ------> uniqueAttributeSearchResult
*                      xpathFormationUsingIndex(parentElement, targetElement) ------> results
*                      findAllAttributesCombination(targetElement, elementList, userPriority) ------> results
*                          findElementUniqueAttribute(targetElement, elementList, "nonUnique", userPriority) -----> nonUniqueAttributeSearchResult
*                          attributeCombination(attributeArr,combinationSize) ------> attributesCombinations
*                          validateXpathAttributesCombinations(targetElement, attributesCombinationsList) ------> locatorSummary
*                      commonParentNode(targetElement, elementWithUniqueAttribute) ------>  commonParentElement
*                      findLevelsBetweenTwoNodes(element, targetElement) ------> count
*                      pathBetweenTwoNodes(targetElement, elementListWithUniqueAttribute[i].element, userPriority)
*                          findElementUniqueAttribute(targetElement, allChildNodes, "one", userPriority) ------> uniqueAttributeSearchResult
*                          xpathFormationUsingIndex(parentElement, targetElement) ------> results
*                      createLocatorListWithPriority(targetElement, locatorSummary, userPriority) ------>  locatorSummary
*/

/**
* this is the main function, given a target element, tell me the robust locator to identify this target element
* @parameter   elementSelected
* @return   locator summary (array)
* the marker of "group": 
* 1 means the case of xpath with targetElement of at least one unique attribute.
* 2 means the case of xpath with targetElement of multiple non unique attribute combinations.
* 3 means the case of common parent element is the target element (element with unique attribute is the child of target element)
* 4 means the case of common parent element is the element with unique attribute (target element is the child of element with unique attribute)
* 5 means the case of common parent element is neither target element nor element with unique attribute (common parent element is the third element)
* 6 means the case of using multi elements with multi attributes (all from userPriority) to create xpath (table case)
* 7 means the case of there is no element with unique attribute in DOM tree.
*/

function findRobustLocatorForSelector(elementSelected, userPriority){
    let targetElement = elementSelected
    let tagContent = getTagContent(targetElement)
    let elementName 
    let uniqueAttributeName
    let uniqueAttributeValue
    let locator = ""
    let results
    let path
    let levels = 0
    let tempLevels = 0
    let locatorSummary = []
    let commonParentElement
    let element
    let issueCount
    let k_1 = 1
    let k_2 = 1

    let count = 0

    //judge if target selector has any unique attribute that can be directly identified from DOM tree, collect all these unique attributes and summarized in locatorSummary
	let elementList = document.getElementsByTagName('*')

    let uniqueAttributeSearchResult = findElementUniqueAttribute(targetElement, elementList, "all", userPriority)
    
    if(uniqueAttributeSearchResult != null){
        elementName = targetElement.tagName

        for(let i = 0; i<uniqueAttributeSearchResult.length; i++){
            if(uniqueAttributeSearchResult[i] == "tagContent"){
                let locatorInfo = createLocatorForTagContent(targetElement, tagContent)
                locatorSummary.push(locatorInfo)
            }else{
                //in this dict, we collect all critical information that used to make priority of the locator
                let locatorInfo = {"element":null, "uniqueAttributeName":null, "uniqueAttributePriority":null, "uniqueAttributeNumber":null, "levels": null, "locator":null, "group": null}

                uniqueAttributeName = uniqueAttributeSearchResult[i]
                uniqueAttributeValue = targetElement.getAttribute(uniqueAttributeName)
                locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']`
                levels = 1

                locatorInfo.element = targetElement
                locatorInfo.uniqueAttributeName = uniqueAttributeName
                locatorInfo.uniqueAttributeNumber = 1
                locatorInfo.levels = levels
                locatorInfo.locator = locator
                locatorInfo.group = 1

                locatorSummary.push(locatorInfo)

                levels = 0
            }
        } 
    }
	
	//then collect all other locator from other element with unique attribute to locatorSummary
	let elementListWithUniqueAttribute = findElementListWithUniqueAttribute(elementList, userPriority)

	//if not, then if the element list with unique attribute is empty, which means all nodes in DOM tree are not unique, this is very rare, then xpath with index
	if(elementListWithUniqueAttribute.length == 0){
		//console.log("There is no element in DOM tree has unique attribute!")
		let locatorInfo = {"element":null, "uniqueAttributeName":null, "uniqueAttributePriority":null, "uniqueAttributeNumber":null, "levels": null, "locator":null, "group": null}

		results = xpathFormationUsingIndex(document.getElementsByTagName('html')[0], targetElement)
		path = results.locator
		levels = results.levels

		locator = "/" + path
		locatorInfo.element = document.getElementsByTagName('html')[0]
		locatorInfo.uniqueAttributeName = null
		locatorInfo.uniqueAttributeNumber = 1
		locatorInfo.levels = levels
		locatorInfo.locator = locator
		locatorInfo.group = 7

		locatorSummary.push(locatorInfo)
	}else{
		//collect all non unique attributes combination which can uniquely identify the target element that form the locator and store it to locatorSummary
		results = findAllAttributesCombination(targetElement, elementList, userPriority)
		for(let i = 0; i<results.length; i++){
			locatorSummary.push(results[i])
		}

		//if not, and there are nodes with unique attribute, so found the common parent node for each element with unique attribute and target selector
		for(let i = 0; i<elementListWithUniqueAttribute.length; i++){
			//skip the case if target element compares to itself (elementListWithUniqueAttribute[i].element)
			if(elementListWithUniqueAttribute[i].element.isEqualNode(targetElement)){
				continue
			}

			let locatorInfo = {"element":null, "uniqueAttributeName":null, "uniqueAttributePriority":null, "uniqueAttributeNumber":null, "levels": null, "locator":null, "group": null}

			commonParentElement = commonParentNode(targetElement, elementListWithUniqueAttribute[i].element)

			//in here, we divide the cases into three situation:
			//1. element with unique attribute is the parent of target element, the common parent node is first one
			//2. target element is the parent of the element with unique attribuet, the common parent node is second one
			//3. target element and element with unique attribute are not in one path, common parent node is some other node.
			if(commonParentElement.isEqualNode(targetElement)){
				element = elementListWithUniqueAttribute[i].element
				count = findLevelsBetweenTwoNodes(element, targetElement)

				elementName = elementListWithUniqueAttribute[i].element.tagName
				uniqueAttributeName = elementListWithUniqueAttribute[i].uniqueAttributeName
				uniqueAttributeValue = elementListWithUniqueAttribute[i].uniqueAttributeValue

				//locating the element with unique attribute and find how many parents level to the target element (common parent node)
				locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']`
				levels = 1

				for(let i = 0; i<count; i++){
					locator = locator + "/.."
					levels = levels + 1
				}

				locatorInfo.element = elementListWithUniqueAttribute[i].element
				locatorInfo.uniqueAttributeName = uniqueAttributeName
				locatorInfo.uniqueAttributeNumber = 1
				locatorInfo.levels = levels
				locatorInfo.locator = locator
				locatorInfo.group = 3

				locatorSummary.push(locatorInfo)

			}else if(commonParentElement.isEqualNode(elementListWithUniqueAttribute[i].element)){
				elementName = elementListWithUniqueAttribute[i].element.tagName
				uniqueAttributeName = elementListWithUniqueAttribute[i].uniqueAttributeName
				uniqueAttributeValue = elementListWithUniqueAttribute[i].uniqueAttributeValue
				locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']`

				results = pathBetweenTwoNodes(targetElement, elementListWithUniqueAttribute[i].element, userPriority)
				path = results.locator
				levels = results.levels

				//locating the element with unique attribute (common parent node) and xpath to the targete element
				locator = locator + path
				locatorInfo.element = elementListWithUniqueAttribute[i].element
				locatorInfo.uniqueAttributeName = uniqueAttributeName
				locatorInfo.uniqueAttributeNumber = 1
				locatorInfo.levels = levels + 1
				locatorInfo.locator = locator
				locatorInfo.group = 4

				locatorSummary.push(locatorInfo)

			}else{
				elementName =  elementListWithUniqueAttribute[i].element.tagName
				uniqueAttributeName = elementListWithUniqueAttribute[i].uniqueAttributeName
				uniqueAttributeValue =  elementListWithUniqueAttribute[i].uniqueAttributeValue
				locator = `//${elementName}[@${uniqueAttributeName}='${uniqueAttributeValue}']`
				tempLevels = tempLevels + 1

				element = elementListWithUniqueAttribute[i].element
				count = findLevelsBetweenTwoNodes(element, commonParentElement)

				for(let i = 0; i<count; i++){
					locator = locator + "/.."
					tempLevels = tempLevels + 1
				}

				results = pathBetweenTwoNodes(targetElement, commonParentElement, userPriority)
				path = results.locator
				levels = results.levels

				//locating the element with unique attribute, and then find the common parent node, then the xpath from common parent node to the targete element
				locator = locator + path
				levels = levels + tempLevels
				locatorInfo.element = elementListWithUniqueAttribute[i].element
				locatorInfo.uniqueAttributeName = uniqueAttributeName
				locatorInfo.uniqueAttributeNumber = 1
				locatorInfo.levels = levels
				locatorInfo.locator = locator
				locatorInfo.group = 5

				locatorSummary.push(locatorInfo)

				tempLevels = 0
			}

			levels = 0
		}
	}

	
	//here are the xpaths by multi elements with multi attributes of group 6:
	let locatorSummaryAfterFiltering = locatorSummaryByMultiElemsMultiAttrs(targetElement, userPriority)
	if(locatorSummaryAfterFiltering.length != 0){
		for(let i=0; i<locatorSummaryAfterFiltering.length; i++){
			locatorSummary.push(locatorSummaryAfterFiltering[i])
		}
	}

    locatorSummary = createLocatorListWithPriority(targetElement, locatorSummary, userPriority)
    locatorSummary = furtherFilteringLocatorListWithUserPriority(locatorSummary, userPriority)
    locatorSummary = splitLocatorListAndFilteringByWeights(locatorSummary, userPriority, k_1, k_2)

    return locatorSummary

    /*
    issueCount = evaluateXpathForTargetSelector(targetElement, locatorList)
    
    if(issueCount == 0){
        return locatorSummary
    }else{
        console.log("Something wrong in the locator Xpath")
    }  
    */
}
