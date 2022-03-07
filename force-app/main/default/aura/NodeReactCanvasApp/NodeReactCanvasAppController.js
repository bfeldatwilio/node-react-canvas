({
	doInit: function (component, evt, helper) {
		var recordId = component.get("v.recordId");
		component.set(
			"v.canvasParameters",
			JSON.stringify({
				recordId: recordId,
			})
		);
	},

	onCanvasLoad: function (component, evt, helper) {
		console.log("^^^^^^^^^^^^^^^^^ Canvas Loaded React ^^^^^^^^^^^^^^^^^");
	},

	onCanvasSubscribed: function (component, event, helper) {
		console.log("^^^^^^^^^^^^^^^^^^^^Canvas Subscribed^^^^^^^^^^^^^^^^^");
	},
});
