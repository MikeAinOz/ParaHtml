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
import * as $ from "jquery";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

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

                let form = target.getElementsByTagName("form");
                if (form[0]) {
                    const finalMsg = document.createElement("p");
                    finalMsg.setAttribute('id', "final_msg");
                    finalMsg.hidden = true;
                    var new_message = document.createTextNode("Message posted");
                    finalMsg.appendChild(new_message);
                    target.appendChild(finalMsg);
                    const failMsg = document.createElement("p");
                    failMsg.setAttribute('id', "fail_msg");
                    failMsg.hidden = true;
                    var new_message = document.createTextNode("POST failed, check URL");
                    failMsg.appendChild(new_message);
                    target.appendChild(failMsg);
                    form[0].onclick = (e) => {
                        target.getElementsByTagName("button")[0].innerText = "Awesome";
                        clickFunction(form[0], settings);
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
                    target.getElementsByTagName("input")[1].value = options.dataViews[0].categorical.values[0].values[0].toString();
                }
                // Web page stuff
                let category = target.getElementsByClassName("category")[0];
                if(category) {
                    console.log("Got Category");
                    category.innerHTML = options.dataViews[0].categorical.categories[0].values[0].toString();
                }
                else{
                    console.log("No Category");
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
                btnClick(payload, settings.targetUrl.targetUrl)

            }
            function btnClick(payload, targetUrl) {
                console.log("button Click");
                let sendData = JSON.stringify(payload);
                console.log(sendData);
                $.ajax({
                    url: targetUrl,
                    type: "POST",
                    data: sendData,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        $('#final_msg').fadeIn();;
                        setTimeout(function () {
                            $('#final_msg').fadeOut();
                        }, 10000)
                    },

                    error: function (jqXhr, textStatus, errorThrown) {
                        $('#fail_msg').fadeIn();;
                        alert(errorThrown);
                        alert(textStatus);
                    },
                    statusCode: {
                        202: function () {
                            alert("202");
                        }
                    }
                });
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