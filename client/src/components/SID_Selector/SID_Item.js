/*
props:
	sid, AgreementSID passed in from the parent
	unlinkSID, function to unlink the SID from the agreement
	linkSID, function to link the SID to the agreement with arguments isPrimary, isFlex
*/

export default function SID_Item(props) {
	const sid = props.sid;
	const alreadyLinked = sid.attributes.type === "Agreement_SID__c";
	const onCheckChange = (e) => {
		if (alreadyLinked) {
			props.unlinkSID(props.sid);
		} else {
			props.linkSID(props.sid, false, false);
		}
	};

	return (
		<li key={sid.Id}>
			<div className="checkbox">
				<input
					type="checkbox"
					className="opacityzero"
					id={sid.Id + "_cb"}
					onChange={onCheckChange}
					checked={alreadyLinked}
				/>
				<label className="inlinebox" htmlFor={sid.Id + "_cb"}>
					{sid.Account_SID__r.Name}
					{sid.Is_Flex_Account_SID__c ? "| Flex" : ""}
					{sid.Is_Primary_Account_SID__c ? " | Primary" : ""}
				</label>
			</div>
		</li>
	);
}
