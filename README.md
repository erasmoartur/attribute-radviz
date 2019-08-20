# A novel visual approach for enhanced attribute analysis and selection

As a consequence of the current capabilities of collecting and storing data, a data set of many attributes frequently reflects more than one phenomenon. Understanding the role of attribute subsets and their impact on the organization and structure of a data set under study is paramount to many exploratory and analytical tasks. Example applications range from medicine to financial markets, whereby one wishes to locate subsets of variables that impact the prediction of target categorical attributes. The user is essential in this context since automated techniques are not currently capable of embedding user knowledge in attribute selections. In this work, we propose an approach to deal with the analysis and selection of attributes in a data set based on three principles: firstly, we center the analysis of the relationships on categorical attributes or labels, because they usually summarize important state variables in the application; secondly, we express the relationship between target attributes and all others in the data set within a single visualization, providing understanding of a large number of correlations in the same visual frame; thirdly, we propose an interactive dual-visual approach whereby changes and selections in attribute space reflect visually on the configuration of data layouts, conceived to support immediate analysis of the impact of selected subsets of attributes in the organization of the data set. We validate our approach by means of a number of case studies, illustrating distinct scenarios of knowledge acquisition and feature selection.

## Authors:

   Erasmo Artur (USP)\
   Rosane Minghim (USP)

## Installing and running

* Download this project and unzip in a local directory
* Open the HTML file in a browser (tested in Chrome, Firefox, and Edge)


## Getting started

* Rendering the first view:
  * Go to _Left panel->CSV File->Choose_ file to pick a CSV file.
  * Then choose a target attribute from _Left panel->Target Attribute_.
* Starting the second view:
  * Go to _Right Panel->Instance identifier_ and choose an attribute to label the instances inside the view
  
### The interface

![alt text](https://raw.githubusercontent.com/erasmoartur/attribute-radviz/master/imgs/screen_interface.png?raw=true)

* _(a)_ File opener
* _(b)_ Target attribute selection
* _(c)_ Define the number of top correlated attributes simultaneously selected when right-clicking over a DA
* _(d)_ Adjust the size of the elements
* _(e)_ Adjust the opacity of the elements
* _(f)_ Adjust the strength of RadViz links
* _(g)_ Adjust the repelling force of the elements (to avoid overlapping)
* _(h)_ Enable/disable visual widgets of the tool (can increase performance)
* _(i)_ Choose the visualization technique for the second view
* _(j)_ Choose an identifier to name the elements in the second view 
* _(k)_ Choose the bound box action in the second view:
  * Show values: Show a table with all values of the selected items
  * Refine: Rebuilds the correlation matrix with only the selected items
* _(l)_ Restart the view
* _(m)_ Enable/disable auto ordering and auto-align
* _(n)_ Define the sample size for the view 
