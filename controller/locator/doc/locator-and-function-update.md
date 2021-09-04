

# How to Handle Locator and Function name change
## Business Challenge
* How to handle change of the locator name?
* How to handle change of the locator hierachy.
* How to handle change of the function name

## Proposed Solution
### How to handle change in locator name
#### User's customized modification
* They just need to modify that through vscode's refactor function

#### Bluestone 
* Recursively find out files that reference to the global locator files with require() function, possible files:
  * bluestone-func.js
  * all files under test case folder
  * And other files that is not in the node-module


### How to handle change of the locator hierachy
#### User's customized modification
* Why do you even want to do it manually? If you want to do that, just take care of that by yourselves.... No good solution

#### Bluestone
* Same as what we do in bluestone locator 

##  Reference
https://stackoverflow.com/questions/49356754/how-to-use-acorn-js-or-similar-library-to-add-a-new-node-to-the-ast-tree

https://www.npmjs.com/package/escodegen