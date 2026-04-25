function ValidatorLite(form, overrideConfig) {

    ValidatorLite.config = {
        onblur: true,
        onsubmit: true,
        keeptext: false,
        appendtext: false,
        feedbackplacement: "after",
        fieldselector: "input,select,textarea",
        addfeedback: true,
        report: true,
        css: {
            error: "is-invalid",
            success: "is-valid",
            loading: "loading",
            feedback: "feedback"
        },
        messages: {
            custom: "Custom validation returned false",
            required: "This field is required",
            pattern: "The field did not match the expected pattern",
            type: "The field did not match the expected type",
            success: "",
            remote: "The remote call failed",
            loading: "Loading...",
            compare: "The fields do not match",
            minlength: "The minimum length of the field has not been met"
        }
    };

    ValidatorLite.extend = function () {

        // Variables
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if (typeof (arguments[0]) != "undefined" &&
            arguments[0] === true) {
            deep = true;
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    // If deep merge and property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = ValidatorLite.extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (i; i < length; i++) {
            var obj = arguments[i];
            merge(obj);
        }
        return extended;
    };

    const spinnerDiv = function () {
        let myDiv = document.createElement("div");
        let mySpan = document.createElement("span");
        myDiv.classList.add("spinner-border", ValidatorLite.config.css.loading);
        myDiv.setAttribute("role", "status");
        mySpan.classList.add("sr-only");
        mySpan.textContent = "...";

        myDiv.append(mySpan);
        return myDiv;
    }

    if (typeof (form) == "string")
        form = document.getElementById(form);

    if (typeof (overrideConfig) != "undefined")
        ValidatorLite.config = ValidatorLite.extend(true, ValidatorLite.config, overrideConfig);

    let fieldSelector = ValidatorLite.config.fieldselector;

    form.querySelectorAll(fieldSelector).forEach((element) => {
        let idCounter = 0;

        let addFeedback = ((element.hasAttribute("data-vl-add-feedback") && element.getAttribute("data-vl-add-feedback")) ||
            element.hasAttribute("data-vl-feedback-id") || ValidatorLite.config.feedback === false) ? false : true;

        if (addFeedback) {
            let newFeedbackElement = document.createElement("label");
            newFeedbackElement.setAttribute("for", element.id);
            newFeedbackElement.classList.add("feedback");
            newFeedbackElement.id = (element.id) ? element.id + "Feedback" + (++idCounter) : element.name + "Feedback" + (++idCounter);

            if (ValidatorLite.config.feedbackplacement === "after")
                element.after(newFeedbackElement)
            else element.before(newFeedbackElement);
            element.setAttribute("data-vl-feedback-id", newFeedbackElement.id);
        }
    });

    ValidatorLite.reportLite = function (element) {
        let feedbackElement = document.getElementById(element.getAttribute("data-vl-feedback-id"));
        let keepText = (element.hasAttribute("data-vl-keep-text")) ? true : ValidatorLite.config.keeptext;
        let appendText = (element.hasAttribute("data-vl-append-text")) ? true : ValidatorLite.config.appendtext;

        if (appendText && (!element["ORIGINAL_TEXT"] || element["ORIGINAL_TEXT"] == ""))
            element["ORIGINAL_TEXT"] = feedbackElement.textContent;

        if (feedbackElement == null) {
            feedbackElement = element.labels[0];
        }
        // Removing loading class from all the labels, input and feedback element
        element.labels.forEach(elem => elem.classList.remove(ValidatorLite.config.css.loading));
        element.classList.remove(ValidatorLite.config.css.loading);
        feedbackElement.classList.remove(ValidatorLite.config.css.loading);

        if (element.checkValidity()) {
            element.setCustomValidity("");

            // Adding success class and removing error class to all the labels
            element.labels.forEach(elem => elem.classList.remove(ValidatorLite.config.css.error));
            element.labels.forEach(elem => elem.classList.add(ValidatorLite.config.css.success));

            element.classList.remove(ValidatorLite.config.css.error);
            element.classList.add(ValidatorLite.config.css.success),

                feedbackElement.classList.remove(ValidatorLite.config.css.error);
            if (!keepText)
                feedbackElement.textContent = (element.getAttribute("data-vl-success-message")) ? element.getAttribute("data-vl-success-message") : ValidatorLite.config.messages.success;
        }
        else {
            let errorMessage = "";
            let errorClass = ValidatorLite.config.css.error;

            // Checking the HTML5 validity state and setting the error message accordingly.
            // If a custom message is set, it will be used instead of the default message.
            if (!keepText) {
                if (element.validity.customError) {
                    let customValidityMessage = element.validationMessage;
                    switch (customValidityMessage) {
                        case "CUSTOM":
                            errorMessage = (element.getAttribute("data-vl-custom-message")) ? element.getAttribute("data-vl-custom-message") : ValidatorLite.config.messages.custom;
                            break;
                        case "REMOTE":
                            errorMessage = (element.getAttribute("data-vl-remote-message")) ? element.getAttribute("data-vl-remote-message") : ValidatorLite.config.messages.remote;
                            break;
                        case "LOADING":
                            errorMessage = (element.getAttribute("data-vl-loading-message")) ? element.getAttribute("data-vl-loading-message") : ValidatorLite.config.messages.loading;
                            errorClass = ValidatorLite.config.css.loading;
                            break;
                        case "COMPARE":
                            errorMessage = (element.getAttribute("data-vl-compare-message")) ? element.getAttribute("data-vl-compare-message") : ValidatorLite.config.messages.compare;
                            break;
                    }
                } else if (element.validity.valueMissing) {
                    errorMessage = (element.getAttribute("data-vl-required-message")) ? element.getAttribute("data-vl-required-message") : ValidatorLite.config.messages.required;
                } else if (element.validity.typeMismatch) {
                    errorMessage = (element.getAttribute("data-vl-type-message")) ? element.getAttribute("data-vl-type-message") : ValidatorLite.config.messages.type;
                } else if (element.validity.patternMismatch) {
                    errorMessage = (element.getAttribute("data-vl-pattern-message")) ? element.getAttribute("data-vl-pattern-message") : ValidatorLite.config.messages.pattern;
                } else if (element.validity.tooShort) {
                    errorMessage = (element.getAttribute("data-vl-minlength-message")) ? element.getAttribute("data-vl-minlength-message") : ValidatorLite.config.messages.minlength;
                }
            }

            // Adding error class and removing success class to all the labels
            element.labels.forEach(elem => elem.classList.add(errorClass));
            element.labels.forEach(elem => elem.classList.remove(ValidatorLite.config.css.success));
            element.classList.add(errorClass);
            element.classList.remove(ValidatorLite.config.css.success);

            if (appendText) {
                feedbackElement.textContent = element["ORIGINAL_TEXT"] + " " + errorMessage;
            } else if (!keepText) {
                feedbackElement.textContent = errorMessage;
            }
            element.setCustomValidity("");
        }

    }

    ValidatorLite.validateListener = function (e) {
        let myElement = (e instanceof HTMLElement) ? e : e.target;
        let report = (myElement.hasAttribute("data-vl-no-report")) ? false : ValidatorLite.config.report;
        var isValid = myElement.checkValidity();
        let feedbackElement = document.getElementById(myElement.getAttribute("data-vl-feedback-id"));
        let myPromises = [];

        if (isValid && myElement.getAttribute("data-vl-custom-validator")) {

            var myPromise = new Promise(async function (resolve, reject) {
                let customReturn = false;
                customReturn = await window[myElement.getAttribute("data-vl-custom-validator")].call(myElement, e);
                if (customReturn)
                    resolve(customReturn);
                else reject(false);
            });
            e.target.setCustomValidity("LOADING");
            myPromise
                .then((result) => {
                    if (result) {
                        myElement.setCustomValidity("");
                        isValid = true;
                    }
                    else {
                        myElement.setCustomValidity("CUSTOM");
                        isValid = false;
                    }
                })
                .catch(error => {
                    myElement.setCustomValidity("CUSTOM");
                    isValid = false;
                })
                .finally(() => {
                    if (report)
                        ValidatorLite.reportLite(myElement);
                });
        }

        if (isValid && myElement.getAttribute("data-vl-remote-url")) {

            var args = { method: "GET" };
            let isGet = (!myElement.hasAttribute("data-vl-remote-method") || new String(myElement.getAttribute("data-vl-remote-method")).toUpperCase() === "GET");
            let myData = {};

            // if there is a data-vl-remote-fields attribute, use the fields from it
            // otherwise just use the id of the current field
            let fieldList = new String((myElement.hasAttribute("data-vl-remote-fields")) ? myElement.getAttribute("data-vl-remote-fields") : myElement.id);
            fieldList = (fieldList.includes(",")) ? fieldList.split(",") : new Array(fieldList);
            for (let i = 0; i < fieldList.length; i++) {
                let fieldName = fieldList[i].trim();
                let fieldValue = { [fieldName]: document.getElementById(fieldName).value }
                myData = { ...myData, ...fieldValue };
            }

            let finalUrl = (!isGet) ? myElement.getAttribute("data-vl-remote-url") : myElement.getAttribute("data-vl-remote-url") + "?" + new URLSearchParams(myData).toString();
            if (!isGet) {
                args = {
                    method: myElement.getAttribute("data-vl-remote-method"),
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(myData)
                };
            }

            myElement.setCustomValidity("LOADING");
            fetch(finalUrl, args)
                .then(result => {
                    let myValidity = result.ok;
                    if (!myValidity)
                        myElement.setCustomValidity("REMOTE");
                    else myElement.setCustomValidity("");
                    return myValidity;
                })
                .catch(error => {
                    myElement.setCustomValidity("REMOTE");
                    return myValidity;
                })
                .finally(() => {
                    if (report)
                        ValidatorLite.reportLite(myElement);
                });
        }

        if (isValid && myElement.hasAttribute("data-vl-compare-to")) {
            let compareElement = document.getElementById(myElement.getAttribute("data-vl-compare-to"));
            if (myElement.value !== compareElement.value) {
                myElement.setCustomValidity("COMPARE");
                isValid = false;
            }
        }

        if (report)
            ValidatorLite.reportLite(myElement);

        return isValid;
    };

    form.querySelectorAll(fieldSelector).forEach((elem) => {
        elem.addEventListener("validateLite", ValidatorLite.validateListener);
        elem.reportValidityLite = () => {
            ValidatorLite.reportLite(elem);
        };

        elem.checkValidityLite = function (report = false) {
            return ValidatorLite.validateListener(elem, report);
        };

        if (ValidatorLite.config.onblur) {
            let validateEvent = new CustomEvent("validateLite", { detail: {}, bubbles: true, cancelable: false });
            elem.addEventListener("blur", (e) => {
                setTimeout(() => {
                    e.target.dispatchEvent(validateEvent);
                }, 0);
            });
        }
    });

    if (ValidatorLite.config.onsubmit) {
        let validateEvent = new CustomEvent("validateLite", { detail: {}, bubbles: true, cancelable: false });
        form.addEventListener("submit", (event) => {
            form.querySelectorAll(fieldSelector).forEach(
                (elem) => {
                    elem.dispatchEvent(validateEvent);
                }
            );

            if (!event.target.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, { capture: true });
    }
}