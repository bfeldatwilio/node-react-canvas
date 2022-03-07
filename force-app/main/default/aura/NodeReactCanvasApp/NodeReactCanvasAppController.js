({
    doInit : function(component, evt, helper) {
        var recordId = component.get("v.recordId");
        // var product = component.get("c.FY_16_Primary_Product__c");
        // console.log('******* record Id ********' + recordId);
        // console.log('******* record type ********' + recordType);
        // console.log('******* Product ********' + product);
        component.set("v.canvasParameters", JSON.stringify({
            recordId: recordId
        }));
    },

    onCanvasLoad : function(component, evt, helper) {
        console.log("^^^^^^^^^^^^^^^^^ Canvas Loaded React ^^^^^^^^^^^^^^^^^");
        window.addEventListener('message', function(event) {
            var data = JSON.parse(event.data);
            if(data.targetModule === 'Canvas' && data.body?.event?.name) {
                console.log('*****Received event from Canvas App **********');
                
            }
        });
    },

    onCanvasSubscribed : function(component, event, helper) {
        console.log('^^^^^^^^^^^^^^^^^^^^Canvas Subscribed^^^^^^^^^^^^^^^^^');
    }
});
