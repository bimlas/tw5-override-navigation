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
	this._stateTitle = "$:/state/bimlas/dispatch-on-next-action";
	var self = this;
	$tw.hooks.addHook("th-navigating", function (event) {
		if (!self._isActive()) return event;
		$tw.utils.nextTick(function () {
			self._dispatchCustomEvent(event.navigateTo);
		});
		return false;
	});
	this.wiki.addEventListener("change", function (changedTiddlers) {
		if (!self._isActive()) return;
		var changedTitle = Object.keys(changedTiddlers)[0];
		if (!changedTitle.startsWith("$:/state/tab")) return;
		$tw.utils.nextTick(function () {
			self._dispatchCustomEvent($tw.wiki.getTextReference(changedTitle));
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
	if($tw.utils.hop(this.attributes,"$linkifyTitle")) {
		this._linkifyTitle = this.getAttribute("$linkifyTitle") === "yes";
		delete this.attributes["$linkifyTitle"];
	}
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
HandlenextlinkWidget.prototype.refresh = function (changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if (Object.keys(changedAttributes).length === 0) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
HandlenextlinkWidget.prototype.invokeAction = function (triggeringWidget, event) {
	if(this._isActive()) {
		$tw.wiki.deleteTiddler(this._stateTitle);
	} else {
		$tw.wiki.setTiddlerData(this._stateTitle, this.attributes);
	}
	return true; // Action was invoked
};

HandlenextlinkWidget.prototype._isActive = function () {
	var state = $tw.wiki.getTiddlerData(this._stateTitle, {});
	return state.type === this.getAttribute("type");
};

HandlenextlinkWidget.prototype._dispatchCustomEvent = function (param) {
	var attributes = $tw.wiki.getTiddlerData(this._stateTitle, {});
	if (this._linkifyTitle) {
		param = "[[" + param + "]]";
	}
	attributes.param = param;
	this.dispatchEvent(attributes);
	$tw.wiki.deleteTiddler(this._stateTitle);
};

exports["action-handlenextlink"] = HandlenextlinkWidget;

})();
