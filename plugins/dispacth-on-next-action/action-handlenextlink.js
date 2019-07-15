/*\
title: $:/plugins/bimlas/handle-next-link-widget/action-widget.js
type: application/javascript
module-type: widget

Action widget to override next navigation (opening internal link or selecting tab)

\*/
(function () {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var HandlenextlinkWidget = function (parseTreeNode, options) {
	this.initialise(parseTreeNode, options);
	this.active = false;
	var self = this;
	$tw.hooks.addHook("th-navigating", function (event) {
		if (!self.active) return event;
		$tw.utils.nextTick(function () {
			self.dispatchCustomEvent(event.navigateTo);
		});
		return false;
	});
	this.wiki.addEventListener("change", function (changedTiddlers) {
		if (!self.active) return;
		var changedTitle = Object.keys(changedTiddlers)[0];
		if (!changedTitle.startsWith("$:/state/tab")) return;
		$tw.utils.nextTick(function () {
			self.dispatchCustomEvent($tw.wiki.getTextReference(changedTitle));
		});
	});
};

/*
Inherit from the base widget class
*/
HandlenextlinkWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
HandlenextlinkWidget.prototype.render = function (parent, nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
HandlenextlinkWidget.prototype.execute = function () {
	this.message = this.getAttribute("$message");
	this.linkifyTitle = this.getAttribute("$linkifyTitle") === "yes";
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
HandlenextlinkWidget.prototype.refresh = function (changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if (changedAttributes["$message"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
HandlenextlinkWidget.prototype.invokeAction = function (triggeringWidget, event) {
	this.active = !this.active;
	return true; // Action was invoked
};

HandlenextlinkWidget.prototype.dispatchCustomEvent = function (param) {
	if (this.linkifyTitle) {
		param = "[[" + param + "]]";
	}
	this.dispatchEvent({
		type: this.message,
		param: param
	});
	this.active = false;
};

exports["action-handlenextlink"] = HandlenextlinkWidget;

})();
