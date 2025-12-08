import { Contact } from "../../common/types/chat";
import React from "react";

interface FPDescriptionTabProps {
  selectedContact: Contact | null;
}

export default function FPDescriptionTab({
  selectedContact,
}: FPDescriptionTabProps): React.JSX.Element {
  return (
    <div className="tab-content">
      <div className="description-content">
        <h3>Description</h3>
        <p>
          {selectedContact?.description ||
            "No description available for this contact."}
        </p>
      </div>
    </div>
  );
}
