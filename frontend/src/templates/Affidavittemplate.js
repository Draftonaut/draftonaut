export const affidavitTemplate = (data) => {
  const sellers = data?.sellers || [];
  const purchasers = data?.purchasers || [];

  const formatPartyNames = (parties, fallback = "") => {
    if (!parties.length) return fallback;

    const names = parties.map((p) => `${p.title || ""} ${p.name || ""}`.trim());

    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;

    return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
  };

  const sellerNames = formatPartyNames(sellers, data?.sellerNames || "");
  const purchaserNames = formatPartyNames(
    purchasers,
    data?.purchaserNames || "",
  );

  const purchaserCount = purchasers.length || 1;

  const iWe = purchaserCount === 1 ? "I" : "We";
  const iWeHave = purchaserCount === 1 ? "I have" : "We have";
  const myOur = purchaserCount === 1 ? "my" : "our";
  const meUs = purchaserCount === 1 ? "me" : "us";
  const iAmWeAre = purchaserCount === 1 ? "I am" : "We are";
  const deponentDesignation = purchaserCount === 1 ? "Deponent" : "Deponents";

  // --- AGE FORMATTING ---
  const ages = purchasers.map((p) => p.age).filter(Boolean);
  let ageString = "";
  if (ages.length === 1) {
    ageString = `aged ${ages[0]} years`;
  } else if (ages.length === 2) {
    ageString = `aged ${ages[0]} and ${ages[1]} years respectively`;
  } else if (ages.length > 2) {
    ageString = `aged ${ages.slice(0, -1).join(", ")} and ${ages[ages.length - 1]} years respectively`;
  }

  // --- PAN FORMATTING ---
  const purchaserPan = purchasers
    .map((p) => p.pan)
    .filter(Boolean)
    .join(", ");
  const panString = purchaserPan ? `having (PAN NO. ${purchaserPan})` : "";

  // --- STATUS FORMATTING ---
  const statusParts = [];
  if (purchaserCount === 1) {
    statusParts.push("an adult");
    statusParts.push("Indian inhabitant");
    if (data?.purchaserAddress)
      statusParts.push(`Resident at ${data.purchaserAddress}`);
  } else if (purchaserCount === 2) {
    statusParts.push("both adults");
    statusParts.push("Indian inhabitants");
    if (data?.purchaserAddress)
      statusParts.push(`Residents at ${data.purchaserAddress}`);
  } else {
    statusParts.push("all adults");
    statusParts.push("Indian inhabitants");
    if (data?.purchaserAddress)
      statusParts.push(`Residents at ${data.purchaserAddress}`);
  }
  const purchaserStatus = statusParts.join(", ");

  // Combine intro parts dynamically so commas format perfectly
  const introParts = [];
  if (ageString) introParts.push(ageString);
  if (panString) introParts.push(panString);
  if (purchaserStatus) introParts.push(purchaserStatus);

  const introText = introParts.join(", ");

  // --- PROPERTY & LEASE FORMATTING ---
  const propertyAddress = data?.propertyAddress || "";

  const validUptoString = data?.leaseValidUpto
    ? `The lease granted is valid upto <strong>${data.leaseValidUpto}</strong>.`
    : "";

  // --- DATE FORMATTING ---
  const execDay = data?.executionDay || "";
  const execMonth = data?.executionMonth || "";
  const execYear = data?.executionYear || "";
  const dateLine =
    execDay || execMonth || execYear
      ? `On this ${execDay} day of ${execMonth}, ${execYear}.`
      : "";

  return `
    <div
      style="
        font-family: 'Times New Roman', Times, serif;
        font-size: 11pt;
        line-height: 1.8;
        text-align: justify;
        color: #000;
      "
    >
      <div style="height: 70px;"></div>

      <div
        style="
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 50px;
        "
      >
        AFFIDAVIT CUM UNDERTAKING FOR TRANSFER
      </div>

      <div style="margin-bottom: 45px;">
        <strong>${purchaserNames}</strong>, ${introText}, do hereby as follows.
      </div>

      <div style="height: 120px;"></div>

      <div style="margin-bottom: 40px;">
        <strong>${propertyAddress}</strong>,
        (hereinafter called the said "<strong>Apartment</strong>"),
        is agreed to be leased or granted lease by
        <strong>
          CITY AND INDUSTRIAL DEVELOPMENT CORPORATION OF MAHARASHTRA LTD.
        </strong>
        (hereinafter for the sake of brevity referred to as
        "<strong>THE CORPORATION</strong>")
        to <strong>${sellerNames}</strong>,
        original lessee for the purpose of residential.
        ${validUptoString}
      </div>

      <div style="height: 60px;"></div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 20px;
        "
      >
        1. That the Original Lessee has agreed to assign / sale the
        above described property in ${myOur} favour and accordingly
        ${iWeHave} agreed to accept the assignment or sale subject
        to the condition that the Corporation grants permission for
        such alienation or transfer.
      </div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 20px;
        "
      >
        2. ${iAmWeAre} aware about the terms and conditions of the
        lease granted in favour of the original lessee by the
        Corporation and ${iWe.toLowerCase()} hereby unconditionally
        agree to abide by these terms and conditions.
      </div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 20px;
        "
      >
        3. ${iAmWeAre} also aware that ${iWe.toLowerCase()} ${purchaserCount === 1 ? "am" : "are"}
        not entitled to transfer, sell, assign, mortgage,
        under-let or otherwise transfer wholly or partly the
        demise premises or interest therein or wholly or partly
        part with possession of the demise premises or permit
        any person to use wholly or partly the demise premises
        without obtaining the permission in writing from the
        Corporation.
      </div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 20px;
        "
      >
        4. ${iWe} also undertake the liability to remove at
        ${myOur} cost unauthorized construction if found to
        have been made by the transferor.
      </div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 20px;
        "
      >
        5. ${iWe} hereby declare that the transfer application
        has been duly signed by the original lessee. If there
        is any discrepancy appearing in the signature on the
        original agreement and this transfer application,
        then for such discrepancy,
        ${iWe} will be solely responsible and the Corporation
        will not be liable or responsible for effecting transfer
        on the basis of such an application. ${iWe} further
        undertake that if any loss or damage is caused to the
        Corporation due to this transfer in ${myOur} favour,
        ${purchaserCount === 1 ? "I shall" : "we shall"}
        indemnify or keep indemnified the Corporation.
      </div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 20px;
        "
      >
        6. ${iWe} also hereby undertake that whatever
        outstanding dues are payable by the original lessee,
        ${iWe} will pay the same without hesitation and
        also further undertake to pay the service charges,
        water charges or fees of the association as per the
        existing rules.
      </div>

      <div
        style="
          padding-left: 35px;
          text-indent: -35px;
          margin-bottom: 35px;
        "
      >
        7. Failure on ${myOur} part or breach of any terms and
        conditions, the Corporation is entitled to evict
        ${meUs} from the said property or to initiate any action
        as per the conditions of lease.
      </div>

      <div style="margin-top: 50px;">
        Solemnly affirmed at ${data?.placeOfExecution || "Navi Mumbai"}
        <br />
        ${dateLine}
      </div>

      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 90px;
        "
      >
        <div>
          Identified by me.
        </div>

        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          "
        >
          <div style="margin-bottom: 70px;"></div>

          <div style="font-weight: bold;">
            ${purchaserNames}
          </div>

          <div style="margin-top: 8px;">
            (${deponentDesignation})
          </div>
        </div>
      </div>
    </div>
  `;
};
