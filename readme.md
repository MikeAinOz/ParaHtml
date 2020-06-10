ParaHtml -HTML Viewer
-----------------

June - 2020
-----------
Disclaimer: This Visual is under continual development please check for updates, it's a Beta.

Feedback is welcome and encouraged, requests may be implemented, issues will be addressed.

This Viewer loads an HTML file from a public URL, the URL must be CORS enabled. Failure due to CORS is silent.Current testing has used files in an Azure Storage Blob Container and pages on a website. 

Sample HTML files are in the html folder

Files are loaded and parsed, the BODY element is loaded into the visual everything above that is not used, so don't bother trying.

Inital proof-of-concept implementation caters for one category and one measure. There are two processing phases Form and Page.

The form mode runs first and allocates the Category and Measure names to the "label" elements and the values to the "input" elements.

The Page mode just does values to a "Category" and "Measure" class. there are two samples for that, the OKY sample is more decorative.

SVG is parsing just fine, there's an SVG example. SVG Substitutes the measure into the first Text item in the SVG

Javascript within the HTML using SCRIPT Tags is nor executed, not to sure why, not too concerned.

At the moment the HTML is loaded every time the visual changes, this may be modified to only load if the setting changes.

The Visual requires a Category and Measure even if they are not used.

The Target works with the form submit button, a JSON Object of the form fields like this: {"Dose":"2","Length":"52.20"} , is sent to the target. This has been tested with Power Automate AKA Flow, I got a CORS related error posting to Zapier



