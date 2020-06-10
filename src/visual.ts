/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import { VisualSettings } from "./settings";


export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        if (document) {

            console.log("Get web page");
            var target = this.target;
            var settings = this.settings

            // using XMLHttpRequest
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this.settings.sourceUrl.sourceUrl, true);
            xhr.onload = function () {
                const parser = new DOMParser();
                const responseDOM: Document = parser.parseFromString(xhr.responseText, 'text/html');
                while (target.firstChild) {
                    target.removeChild(target.lastChild);
                }

                target.appendChild(parseBody(responseDOM));

                let form: HTMLFormElement = target.getElementsByTagName("form")[0]as HTMLFormElement;
                if (form) {
                    const message = document.createElement("p");
                    message.setAttribute('class', "message");
                    form.appendChild(message);
                    let button = form.getElementsByTagName("button")[0];
                    button.onclick = (e) => {
                        clickFunction(form, settings);
                        e.preventDefault();
                    }
                }

                if (target.getElementsByTagName("label")[0]) {
                    target.getElementsByTagName("label")[0].innerText = options.dataViews[0].categorical.categories[0].source.displayName
                }
                if (target.getElementsByTagName("label")[1]) {
                    target.getElementsByTagName("label")[1].innerText = options.dataViews[0].categorical.values[0].source.displayName
                }
                if (target.getElementsByTagName("input")[0]) {
                    target.getElementsByTagName("input")[0].value = options.dataViews[0].categorical.categories[0].values[0].toString();
                }
                if (target.getElementsByTagName("input")[1]) {
                    let iValueFormatter = valueFormatter.create({ format: options.dataViews[0].categorical.values[0].source.format });
                    target.getElementsByTagName("input")[1].value = iValueFormatter.format(options.dataViews[0].categorical.values[0].values[0]);
                }
                // Web page stuff
                let category = target.getElementsByClassName("category")[0];
                if (category) {
                    console.log("Got Category");
                    category.innerHTML = options.dataViews[0].categorical.categories[0].values[0].toString();
                }
                               let measure = target.getElementsByClassName("measure")[0];
                if (measure) {
                    console.log("Got Measure")
                    let iValueFormatter = valueFormatter.create({ format: options.dataViews[0].categorical.values[0].source.format });
                    measure.innerHTML = iValueFormatter.format(options.dataViews[0].categorical.values[0].values[0]);
                }
                // SVG Text Element
                if (target.getElementsByTagName("text")[0]) {
                    console.log("Set Text", options.dataViews[0].categorical.values[0].values[0]);
                    let iValueFormatter = valueFormatter.create({ format: options.dataViews[0].categorical.values[0].source.format });
                    target.getElementsByTagName("text")[0].textContent = 
                         iValueFormatter.format(options.dataViews[0].categorical.values[0].values[0]);
                }
            };
            xhr.onerror = function () {
                target.appendChild(document.createTextNode("Document not loaded, check Url"));
            }
            xhr.send();

            function parseBody(theDocument: Document): Element {
                console.log("Parse Body");
                let theBody = theDocument.getElementsByTagName("BODY");
                let elementOne: Element = theBody[0];
                return elementOne;
            }
            function clickFunction(form: HTMLFormElement, settings) {
                let category = form.getElementsByTagName("input")[0];
                let measure = form.getElementsByTagName("input")[1];
                let payload = Object.create(null);
                payload[target.getElementsByTagName("label")[0].innerText] = category.value;
                payload[target.getElementsByTagName("label")[1].innerText] = measure.value;
                btnClick(form, payload, settings.targetUrl.targetUrl)
            }
            function btnClick(form: HTMLFormElement, payload, targetUrl) {
                console.log("button Click");
                let sendData = JSON.stringify(payload);
                console.log(sendData);
                let xhr = new XMLHttpRequest();
                let url = targetUrl;
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                        form.getElementsByClassName("message")[0].innerHTML = "Form Posted";
                    }
                    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status != 200) {
                        form.getElementsByClassName("message")[0].innerHTML = "Error " + xhr.status.toString();
                    }
                }
                xhr.send(sendData);
            }
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }

}