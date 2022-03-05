import React from "react";

export default function EmptyState(props) {
	const url = props.loginUrl + "/projRes/ui-home-private/emptyStates/noEvents.svg";
	return (
		<div className="slds-illustration slds-illustration">
			<img alt="No Agreement SIDs yet" src={url} />
			<div className="slds-text-longform">
				<h3 className="slds-text-heading_medium">Agreement SIDs</h3>
				<div className="centered">
					<ol>
						<li>Use the Link SIDs button to add some SIDs</li>
						<li>Select a SID to be Primary/Flex</li>
					</ol>
				</div>
			</div>
		</div>
	);
}
