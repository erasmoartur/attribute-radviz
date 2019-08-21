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
* _(o)_ Define the options to export the current selection
* _(p)_ Define the t-SNE parameters
* _(q)_ Enable/disable the bars in the second view
* _(r)_ Show the silhouette values for:
  * Original data
  * Selected data
  * Selected and projected (RadViz) data
* _(u)_ Search attributes by name
* _(s)_ Refresh the second view
* _(t)_ Search items by name


### The interactivity

* You can freely manipulate the DAs in both views.

* By hovering the pointer over DAs in the attribute view, the correlation data between attributes and the current DA-label is encoded in element sizes, returning to regular sizes when removing the pointer. 

* Correlation information between a particular attribute and all data labels is exposed by hovering the pointer over this attribute inside the attribute view. This information arises from arcs of DAs, information bars and influence lines.

* You can remove label values by dragging out DAs. Thus, the correlation matrix will be recalculated containing only the remaining label values. This mechanism is particularly useful when users notice some already segregated label value (observing the second view); hence, you could remove this label to focus on interesting attributes of the remaining label values.

* If you want to select a large number of attributes, you can use two distinct multi-selection mechanisms. The first one is the bounding box, which allows multiple selections inside the unit circle. The second is the multi-select click, where you right-click on a DA-label and the _P_ strongest correlated attributes (not yet selected) are included. The _P_ value is defined in the control panel.

* To start the second view, you must choose an attribute in the right panel  to identify the items. 

* You can choose the visualization method between RadViz and t-SNE. Selecting RadViz, when hovering the pointer over the elements, arcs and information bars expose the actual data values of the selected item proportionally. 

* By hovering the pointer over DAs, the values of the attribute represented by that DA encodes new sizes of elements in the projection. It is possible to do this also by hovering over attributes in the attribute view, providing coordination between views during analysis. This could give the user a sense of how each attribute affects the labels and items. 

* Every attribute selected in the attribute view or in the list of attributes is added to the second view. 

### Sample data sets

We have included three sample data sets that can help you to get started within the tool. Feel free to analyze and select attributes until you be able to play with your own data sets. The data sets are:
