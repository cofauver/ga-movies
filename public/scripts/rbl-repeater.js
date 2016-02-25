'use strict';
/**
 * Created by Leon Revill on 10/01/2016.
 * Blog: http://www.revilweb.com
 * GitHub: https://github.com/RevillWeb/rebel-repeater
 * Twitter: @RevillWeb
 */

/*
	Note from Cory Fauver 2/24/16
	=============================
	This extremely nice package came from the blog post at
	https://jsinsights.com/writing-ngrepeat-as-a-web-component-fddfa963fee7#.mlopkwjzi
	and simulates the ng-repeat functionality with a JavaScript
	only web component. We use the custom element rbl-repeater,
	alter its content JSON and it will create copies of each
	of the contained HTML for each element in the content
	JSON.

	As it existed, the component was not prepared to actively update.
	Once it had filled in the template the first time, innerHTML on 
	line 39 returned an empty string because it referred to a piece 
	of shadow DOM which was not accessible.
*/ 

class RblRepeater extends HTMLElement {
    createdCallback() {
        if (this.getAttribute('shadow') != "false") {
            this.createShadowRoot();
        }
    }
    attachedCallback() {
        this.render();
    }
    render() {
        const content = RblRepeater.fromJson(this.getAttribute('content'));
        const element = this.getAttribute('element');
        /*This is where I altered to make it responsive. I inserted the template*/ 
        const template = (this.innerHTML) ? this.innerHTML:'<li><img class="movie-poster" src="${Poster}"><h1>${Title}</h1></li>';
        // console.log(template); // for debugging purposes
        let html = (element !== null ) ? "<" + element.toLowerCase() + ">" : "";
        if (Array.isArray(content)) {
            content.forEach(function(item){
                html += RblRepeater.interpolate(template, item);
            });
        } else {
            throw new Error("Content should be an Array of objects.");
        }
        html += (element !== null ) ? "</" + element.toLowerCase() + ">" : "";
        if (this.getAttribute('shadow') != "false") {
            this.shadowRoot.innerHTML = html;
            this.innerHTML = "";
        } else {
            this.innerHTML = html;
        }
    }
    attributeChangedCallback(name) {
        switch (name) {
            case "content":
                this.render();
                break;
        }
    }
    static interpolate(template, obj) {
        if (typeof obj == "object") {
            for (var key in obj) {
                const find = "${" + key + "}";
                if (template.indexOf(find) > -1) {
                	if(obj[key] === 'N/A'){
                		template = template.replace(find, 'images/bobines-video-icon.png')
                	}else{
                    	template = template.replace(find, obj[key]);
                    	delete obj[key];
                    }
                }
            }
        }
        return template;
    }
    static fromJson(str) {
        let obj = null;
        if (typeof str == "string") {
            try {
                obj = JSON.parse(str);
            } catch (e) {
                throw new Error("Invalid JSON string provided. ");
            }
        }
        return obj;
    }
}

document.registerElement("rbl-repeater", RblRepeater);