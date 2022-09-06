# Structure-based auto-healing algorithm
## Algorithm Scenario
### Strategy
Depenps on the type of the target eleemnt, we are going to conduct different type of comparison

### Atomic Element
* 


## Similarity Analysis Scenario
### Element contains text or tooltips
* Definition
  * Button/Text/Pic or other non-input elements
* Similarity Calculation
  * Score = Similarity(text)+similarity(tool tips)
  * 

NLP comparison with text and tooltips

### input 
* Definition
  * input tagbox
* Similarity Analysis
  * Dom-based neighbor similarity + Similarity(tool tips)

### select 
* Definition
  * select tag
* Similarity Analysis
  * Dom-based neighbor similarity + Similarity(tool tips) + Option-based similarity

### Simple List
* Definition
  * 1 Layer list that only contains text
  * If next level is a list, it will try to go deep and try to see if two level can be merged based on its length
* Key consideration in simple list comparison
  * Is it a structured list or unsructured list
  * The length of the list
  * The similarity of elements
  * Is the elements at the same index has the same meaning(?)
* Similarity Calculation
  * List Length Analsyis abs(length_new-length_old)/length_old
  * Mix-and-match Similarity - Greed, get maximum of match+exact match analysis
  * Index-Based Similarity - Similarity analysis across same index pair


### Simple Table
* Definition
  * A table only contains textual atomic elements or list
* Similarity Score
  * Row Header Similarity + Column Header Smilarity + Context-based Target Row Similarity + Context-based Cell Equality Check + Index-based Cell Equality Check 
* If table is target element
  * Context-based Target Column Similarity + Index-based Target Row Similarity + Index-based Target Column Similarity + Context-based Target Cell Similarity + Index-based Target Cell similarity

### Nested Elements
#### Definition
  * List within List
  * Table within list
  * Table within list
  * list within table
#### Strategy
*  Conduct Shallow Comparision
   *  Detailed Comparison on immediate level (Detailed)
   *  Conduct textual analysis for 2nd level (Rough and quick)
#### Nested List
* Similarity Calculation Approach
  * Use Simple List Calculation to get similarity
  * Based on matching from prior step, conduct rough textual comparison to get similarity

#### Nested Table
* It can be handled the same way as how we handled simple table

## When to stop similarity analysis

## Challenge of top-down approach
1. What if there is missing layer
2. What if there is added layer?