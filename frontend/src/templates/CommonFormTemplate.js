export const commonFormTemplate = (data) => {
  const sellerName = data.sellerNames || "(SELLER FULL NAME)";
  const purchaserName = data.purchaserNames || "(PURCHASER FULL NAME)";

  // Grammatical Logic for Sellers (Transferors)
  const isMultiSeller = data.sellers && data.sellers.length > 1;
  const sLabel = isMultiSeller ? "Sellers" : "Seller";
  const sTransferor = isMultiSeller ? "Transferors" : "Transferor";
  const sMember = isMultiSeller ? "members" : "member";
  const sOwner = isMultiSeller ? "owners" : "owner";
  const sProSubj = isMultiSeller ? "We" : "I";
  const sProObj = isMultiSeller ? "us" : "me";
  const sProPoss = isMultiSeller ? "our" : "my";
  const sIsAre = isMultiSeller ? "are" : "is";
  const sAmAre = isMultiSeller ? "are" : "am";
  const sAdult = isMultiSeller ? "adults" : "adult";
  const sHasHave = isMultiSeller ? "have" : "has";
  const sTheyHeShe = isMultiSeller ? "they" : "he/she";
  const sHisTheir = isMultiSeller ? "their" : "his/her";
  const sPerson = isMultiSeller ? "Persons" : "Person";
  const sMemberLabel = isMultiSeller ? "members" : "a member";

  // Grammatical Logic for Purchasers (Transferees)
  const isMultiPurchaser = data.purchasers && data.purchasers.length > 1;
  const pLabel = isMultiPurchaser ? "Purchasers" : "Purchaser";
  const pTransferee = isMultiPurchaser ? "Transferees" : "Transferee";
  const pMember = isMultiPurchaser ? "members" : "member";
  const pProSubj = isMultiPurchaser ? "We" : "I";
  const pProObj = isMultiPurchaser ? "us" : "me";
  const pProPoss = isMultiPurchaser ? "our" : "my";
  const pIsAre = isMultiPurchaser ? "are" : "is";
  const pAmAre = isMultiPurchaser ? "are" : "am";
  const pHisTheir = isMultiPurchaser ? "their" : "his/her";
  const pIndividual = isMultiPurchaser ? "individuals" : "individual";
  const pPerson = isMultiPurchaser ? "Persons" : "Person";

  // Helper functions for mapping multiple properties
  const getSellerAge = () => {
    if (!data.sellers || data.sellers.length === 0) return "(seller age)";
    return data.sellers.map((s) => s.age).join(", ") || "(seller age)";
  };

  const getSellerPan = () => {
    if (!data.sellers || data.sellers.length === 0)
      return "(Seller Pan Number)";
    return data.sellers.map((s) => s.pan).join(", ") || "(Seller Pan Number)";
  };

  const sellerAge = getSellerAge();
  const sellerPan = getSellerPan();

  // Helper to Capitalize first letter dynamically
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // --- NEW: Indian Currency Formatter ---
  const formatIndianCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "RS. (Total Consideration Amount)/-";

    const num = parseInt(amount, 10);
    const formatString = new Intl.NumberFormat("en-IN").format(num); // Adds Indian commas

    const a = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return "Overflow";
      let nArray = ("000000000" + n)
        .substr(-9)
        .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nArray) return "";
      let str = "";
      str +=
        nArray[1] != 0
          ? (a[Number(nArray[1])] || b[nArray[1][0]] + " " + a[nArray[1][1]]) +
            "Crore "
          : "";
      str +=
        nArray[2] != 0
          ? (a[Number(nArray[2])] || b[nArray[2][0]] + " " + a[nArray[2][1]]) +
            "Lakh "
          : "";
      str +=
        nArray[3] != 0
          ? (a[Number(nArray[3])] || b[nArray[3][0]] + " " + a[nArray[3][1]]) +
            "Thousand "
          : "";
      str +=
        nArray[4] != 0
          ? (a[Number(nArray[4])] || b[nArray[4][0]] + " " + a[nArray[4][1]]) +
            "Hundred "
          : "";
      str +=
        nArray[5] != 0
          ? (str != "" ? "and " : "") +
            (a[Number(nArray[5])] || b[nArray[5][0]] + " " + a[nArray[5][1]])
          : "";
      return str.trim();
    };

    const words = inWords(num);
    return `Rs. ${formatString}/- (Rupees ${words} Only)`;
  };

  const considerationText = formatIndianCurrency(data.totalConsideration);

  return `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; color: #000;">
      
      <div style="margin-bottom: 50px; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <p>Dated: _________________</p>
        </div>
        <p>To,<br>
        The Estate Officer,<br>
        Cidco Ltd., Koparkhairane<br>
        Navi Mumbai</p>
        
        <p style="margin: 20px 0;"><strong>Sub : Transfer Of Shares and interest in the Capital of the property at ${data.propertyAddress || "(Full Property Address)"}, (Issue of No-Objection NOC).</strong></p>
        
        <p>Sir,</p>
        <p>It is intimated the Managing Committee of the Society have received the Application from ${sLabel} <strong>${sellerName}</strong>, ${sMember} of our Society holding the above said Flat and it has been Resolved that <strong>${purchaserName}</strong>, to be admitted as New ${capitalize(pMember)}.</p>
        
        <p>RESOLVED that the RESIGNATION Letter of <strong>${sellerName}</strong>, (${sLabel}) have been accepted from the Membership of the Society which have been also Resolved with the Membership of the ${pLabel.toLowerCase()} <strong>${purchaserName}</strong>, have been Considered subject to permission of CIDCO.</p>
        
        <div style="text-align: right; margin-top: 60px;">
          <p><strong>${data.societyName || "Society Full name"}</strong></p>
          <br><br>
          <p>(Authorized Signatory)</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <div style="text-align: center; margin-bottom: 20px;">
          <p><strong>${data.societyName || "Society Full name"}</strong></p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <p>Dated: _________________</p>
        </div>
        <p>To,<br>
        The Estate officer,<br>
        Cidco Ltd., Koparkhairane<br>
        Navi Mumbai</p>
        
        <h2 style="text-align: center; text-decoration: underline; font-size: 18px; margin: 20px 0;">RESOLUTION</h2>
        
        <p>Extract from proceeding of the managing committee meeting property <strong>${data.propertyAddress || "(Full Address)"}</strong>, held on ______________</p>
        
        <p>Resolved that the resignation of the following ${sMember} for Flat No ________, on the ________ Floor, have been accepted by the Managing committee.</p>
        <p><strong>${sellerName}</strong>, (${sLabel})</p>
        
        <p>Resolved that the new membership of the following ${pMember} have been accepted by the managing committee in place of old ${sMember}.</p>
        <p><strong>${purchaserName}</strong>, (${pLabel})</p>
        
        <p>Resolved that new ${pMember} will have to pay necessary Transfer charges to CIDCO LTD as per the rules.</p>
        <p>As per the society record the area of the Flat is as Below.</p>
        
        <div style="text-align: right; margin-top: 60px;">
          <p><strong>${data.societyName || "Society Full name"}</strong></p>
          <br><br>
          <p>(Authorized Signatory)</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <div style="text-align: center; margin-bottom: 30px;">
          <p><strong>${data.societyName || "Society Full name"}</strong></p>
        </div>
        <h2 style="text-align: center; text-decoration: underline; font-size: 18px; margin: 30px 0;">TO WHOMSOEVER IT MAY CONCERN</h2>
        
        <p>This is to certify that <strong>${sellerName}</strong>, ${sIsAre} bonafide ${sMember} of our society and ${sOwner} <strong>${data.propertyAddress || "(Full Address name)"}</strong> ${sTheyHeShe} ${sHasHave} cleared all the dues, charges and taxes Inclusive of Maintenance charges and share transfer charges till date of this No Objection Certificate.</p>
        
        <p>The Society have No Objection to Sale/ Transfer aforesaid Flat in Favour of <strong>${purchaserName}</strong>, Subject to Cidco Rule and Regulations as well as Society Rule.</p>
        
        <div style="margin-top: 40px;">
          <p>Thanking you,</p>
          <div style="text-align: right; margin-top: 40px;">
            <p><strong>${data.societyName || "Society Full name"}</strong></p>
            <br><br>
            <p>(Authorized Signatory)</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p>To,<br>
        The Estate Office<br>
        Cidco Ltd.<br>
        Koparkhairane<br>
        Navi Mumbai</p>
        
        <p style="margin: 20px 0;"><strong>SUB : MORTGAGE of : ${data.propertyAddress || "(Full Address name)"}.</strong></p>
        
        <p>This is to certify that <strong>${purchaserName}</strong>, intending ${pLabel.toLowerCase()} <strong>${data.propertyAddress || "(Full Address name)"}</strong> The Society has no objection for Mortgage of the Flat and obtained Loan from <strong>${data.bankName || "(BANK NAME)"}</strong> This letter is issued for complying with the requisite transfer formalities with the CIDCO concerned authorities.</p>
        
        <div style="text-align: right; margin-top: 60px;">
          <p><strong>${data.societyName || "Society Full name"}</strong></p>
          <br><br>
          <p>(Authorized Signatory)</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="text-align: left; width: 350px;">
            <p style="margin: 0;"><strong>${sellerName}</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.sellerAddress || "(SELLER ADDRESS)"}</p>
            <p style="margin-top: 10px;">Dated : _________________</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p style="margin: 20px 0;"><strong>SUB : Resignation as a ${capitalize(sMember)} of the Society and SALE NOC to the New owner.</strong></p>
        
        <p>${sProSubj} <strong>${sellerName}</strong>, the bonafide ${sMember} of society holding <strong>${data.propertyAddress || "(Full Address name)"}</strong>.</p>
        
        <p>${sProSubj} ${sAmAre} not able to continue as a ${sMember} of your society, so ${sProSubj} have decided to sell ${sProPoss} <strong>${data.propertyAddress || "(Full Address name)"}</strong> to <strong>${purchaserName}</strong> for proper consideration.</p>
        
        <p>${sProSubj} have submitted the papers for CIDCO Transfer/Registration of Flat in favour of the ${pLabel.toLowerCase()}.</p>
        
        <p>${sProSubj.toUpperCase()} DO HEREBY SUBMIT ${sProPoss.toUpperCase()} RESIGNATION AS A ${sMember.toUpperCase()} OF THE SOCIETY ${sProSubj} ${sAmAre} requested to grant SALE NOC in favour of <strong>${purchaserName}</strong> as accept ${sProPoss} Resignation as a ${sMember} of your society.</p>
        
        <p>${sProSubj} do hereby request that the Sale NOC may please be granted in favour of the ${pLabel} and oblige.</p>
        
        <p>${sProSubj} do hereby authorize <strong>${purchaserName}</strong> to collect the Sale NOC from the society either in ${pHisTheir} name.</p>
        
        <div style="margin-top: 40px;">
          <p>Thanking you,</p>
          <div style="text-align: right; margin-top: 20px;">
            <p>Yours faithfully</p>
            <br><br><br>
            <p><strong>${sellerName}</strong><br>
            (${capitalize(sMember)} of the Society)</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p>Date: _________________</p>
        <h2 style="text-align: center; text-decoration: underline; font-size: 18px; margin: 20px 0;">AUTHORITY LETTER</h2>
        
        <p>${sProSubj} <strong>${sellerName}</strong>, aged- <strong>${sellerAge}</strong> years, having Pan No. <strong>${sellerPan}</strong>, an ${sAdult}, Indian inhabitants, having address at <strong>${data.sellerAddress || "(Seller Address)"}</strong> ${sProSubj} have applied CIDCO for Transfer of <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, to <strong>${purchaserName}</strong>, vide application No. ______________ dt. ______________.</p>
        
        <p>However, due to some ${sProPoss} personal reasons, ${sProSubj} ${sAmAre} unable to attend CIDCO office in this matter.</p>
        
        <p>Therefore, ${sProSubj} have authorized Mr._______________________,address __________________________________________ Telephone No. ___________________ to appear on ${sProPoss} behalf on CIDCO office in this matter to submit ${sProPoss} application and to receive Transfer NOC, Mortgage NOC and all other relevant papers.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div>
            <p>Specimen Signature Of Authorized ${sPerson}</p>
            <p style="margin-top: 40px;">___________________________</p>
          </div>
          <div style="text-align: center;">
            <br><br><br>
            <p><strong>${sellerName}</strong></p>
            <p>${sLabel}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 60px;">
          <br><br>
          <p><strong>${purchaserName}</strong></p>
          <p>${pLabel}</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="text-align: left; width: 350px;">
            <p style="margin: 0;">From: <strong>${purchaserName}</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.purchaserAddress || "(Purchaser Address)"}</p>
            <p style="margin-top: 10px;">Dated: _________________</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">THE ASSISTANT ESTATE OFFICER</p>
          <p style="margin: 0;">CIDCO, KOPARKHAIRANE,</p>
          <p style="margin: 0;">NAVI MUMBAI.</p>
        </div>
        
        <p>Sir</p>
        <p style="margin: 20px 0;"><strong>Sub : ${data.propertyAddress || "(Full Property Address)"}.</strong></p>
        
        <p>With reference to your Sale Permission vide Letter No. CIDCO/AEO/ ____________ date_______________ in respect of following <strong>${data.propertyAddress || "(Full Property Address)"}</strong>,</p>
        
        <p>As ${pProSubj} ${pAmAre} raising loan from <strong>${data.bankName || "M/S.______________________________________"}</strong></p>
        
        <p>You are requested to grant ${pProObj} the MORTGAGE NOC and oblige.</p>
        <p>${pProSubj} ${pAmAre} ready and willing to pay the administrative charges for grant of MORTGAGE NOC.</p>
        
        <div style="margin-top: 40px;">
          <p>Thanking you,</p>
          <div style="text-align: right; margin-top: 20px;">
            <p>Yours Faithfully,</p>
            <br><br><br>
            <p><strong>${purchaserName}</strong><br>
            ${pLabel}</p>
          </div>
        </div>
      </div>

<div style="margin-bottom: 50px; page-break-after: always;">
        <p style="text-align: left; font-weight: bold;">APPENDIX -14<br>(For Society's Record)</p>
        <h2 style="text-align: center; font-size: 18px; margin: 20px 0;">FORM OF NOMINATION APPLICATION<br>TO BE FURNISHED IN ORIGINAL</h2>
        <p style="text-align: center;">(Under the Bye-Law No. 32)</p>
        
        <div style="margin-bottom: 20px; margin-top: 30px;"> 
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p>Sir,</p>
        <p>1) ${pProSubj} <strong>${purchaserName}</strong> ${pIsAre} ${pMember} <strong>${data.societyName || "(Society Name)"}</strong> having registered address at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>,</p>
        
        <p>2) ${pProSubj} hold the Share Certificate No. <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, for ten fully paid up share of Rs.50/- each, bearing distinctive numbers from <strong>${data.shareDistinctiveFrom || "(Share Certificate From)"}</strong>, to <strong>${data.shareDistinctiveTo || "(Share Certificate To.)"}</strong>, under <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, issued by the said society to ${pProObj}.</p>
        
        <p>3) ${pProSubj} also hold the at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, in the building of the said society.</p>
        
        <p>4) As provided under Rule 25 of the Maharashtra Co-operative Societies Rules, 1961. ${pProSubj} hereby nominate the person whose particulars are as given below.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;" border="1">
          <tr>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Sr. No.</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Name of the Nominee</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Permanent address of the Nominee</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Relationship with the Nominator</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Share of each Nominees (percentage)</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Date of Birth Of the Nominee if the Nominee Is a Minor</th>
          </tr>
          <tr><td style="padding: 15px; text-align: center;">1)</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px; text-align: center;">2)</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px; text-align: center;">3)</td><td></td><td></td><td></td><td></td><td></td></tr>
        </table>
        
        <p>5) As provided under section 30 of the Maharashtra Co-operative Societies Act. 1960 on ${pProPoss} death, the shares mentioned above should please be transferred to the name of the above mentioned nominee, on his the complying with the provisions of the Bye-laws of the Society for the membership.<br>
        <strong>OR</strong><br>
        6) As provided under section 30 of the Maharashtra Co-operative Societies Act. 1960 and the Bye-laws of the Society, ${pProSubj} state on ${pProPoss} death, the shares mentioned above and ${pProPoss} interest of the flat, the details of which are given above, should be transferred to Mr/Mrs...... the first-named nominee on his/her complying with the provisions of the Bye-laws of the Society regarding requirements of admission to membership, indemnifying the Society, against any claims made to the said shares and ${pProPoss} interest in the said flat by the other Nominee/Nominees.</p>
        
        <p>7) As Mr/Mrs.... the Nominee at Sr. No. ______ is the minor, ${pProSubj} hereby appoint Mr /Mrs..... as the guardian of the minor to represent the minor-nominee in the matters connected with this nomination.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div>
            <p>Place : _________________</p>
            <p>Date : _________________</p>
          </div>
          <div style="text-align: center;">
            <p><strong>${purchaserName}</strong></p>
            <p>Signature of the Nominator ${capitalize(pMember)}</p>
          </div>
        </div>
        
        <p style="margin-top: 40px;"><strong>Witnesses :</strong></p>
        <p>Name and Addresses of Witnesses : ________________________________________ Signature of the Witness</p>
        <p>1) Shri/Shrimati . ________________________________________ Address ...________________________________________</p>
        <p>2) Shri/Shrimati ________________________________________ Address ________________________________________</p>
        
        <div style="margin-top: 50px; border-top: 2px dashed #000; padding-top: 30px;">
          <p>Place : _________________</p>
          <p>Date : _________________</p>
          <br>
          <p>The Nomination Application was placed in the meeting of the Managing Committee of the society held on _______________.</p>
          <p>And the same was accepted / rejected.</p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
              <p>Date : _________________</p>
            </div>
            <div style="text-align: center;">
              <p>Hon. Secretary</p>
              <br>
              <p><strong>${data.societyName || "(Society Name)"}</strong></p>
            </div>
          </div>
          
          <p style="margin-top: 40px;">Received the Nomination Application duly accepted in Original.</p>
          <p style="margin-top: 40px;">________________________________________<br>Signature of the Nomination Member</p>
          <p style="font-size: 12px; margin-top: 10px;">* Strike out which is not applicable.</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="text-align: left; font-weight: bold;">APPENDIX -14<br>(For Society's Record)</p>
        <h2 style="text-align: center; font-size: 18px; margin: 20px 0;">FORM OF NOMINATION APPLICATION<br>TO BE FURNISHED IN DUPLICATE</h2>
        <p style="text-align: center;">(Under the Bye-Law No. 32)</p>
        
        <div style="margin-bottom: 20px; margin-top: 30px;"> 
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p>Sir,</p>
        <p>1) ${pProSubj} <strong>${purchaserName}</strong> ${pIsAre} ${pMember} <strong>${data.societyName || "(Society Name)"}</strong> having registered address at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>,</p>
        
        <p>2) ${pProSubj} hold the Share Certificate No. <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, for ten fully paid up share of Rs.50/- each, bearing distinctive numbers from <strong>${data.shareDistinctiveFrom || "(Share Certificate From)"}</strong>, to <strong>${data.shareDistinctiveTo || "(Share Certificate To.)"}</strong>, under <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, issued by the said society to ${pProObj}.</p>
        
        <p>3) ${pProSubj} also hold the at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, in the building of the said society.</p>
        
        <p>4) As provided under Rule 25 of the Maharashtra Co-operative Societies Rules, 1961. ${pProSubj} hereby nominate the person whose particulars are as given below.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;" border="1">
          <tr>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Sr. No.</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Name of the Nominee</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Permanent address of the Nominee</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Relationship with the Nominator</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Share of each Nominees (percentage)</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Date of Birth Of the Nominee if the Nominee Is a Minor</th>
          </tr>
          <tr><td style="padding: 15px; text-align: center;">1)</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px; text-align: center;">2)</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px; text-align: center;">3)</td><td></td><td></td><td></td><td></td><td></td></tr>
        </table>
        
        <p>5) As provided under section 30 of the Maharashtra Co-operative Societies Act. 1960 on ${pProPoss} death, the shares mentioned above should please be transferred to the name of the above mentioned nominee, on his the complying with the provisions of the Bye-laws of the Society for the membership.<br>
        <strong>OR</strong><br>
        6) As provided under section 30 of the Maharashtra Co-operative Societies Act. 1960 and the Bye-laws of the Society, ${pProSubj} state on ${pProPoss} death, the shares mentioned above and ${pProPoss} interest of the flat, the details of which are given above, should be transferred to Mr/Mrs...... the first-named nominee on his/her complying with the provisions of the Bye-laws of the Society regarding requirements of admission to membership, indemnifying the Society, against any claims made to the said shares and ${pProPoss} interest in the said flat by the other Nominee/Nominees.</p>
        
        <p>7) As Mr/Mrs.... the Nominee at Sr. No. ______ is the minor, ${pProSubj} hereby appoint Mr /Mrs..... as the guardian of the minor to represent the minor-nominee in the matters connected with this nomination.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div>
            <p>Place : _________________</p>
            <p>Date : _________________</p>
          </div>
          <div style="text-align: center;">
            <p><strong>${purchaserName}</strong></p>
            <p>Signature of the Nominator ${capitalize(pMember)}</p>
          </div>
        </div>
        
        <p style="margin-top: 40px;"><strong>Witnesses :</strong></p>
        <p>Name and Addresses of Witnesses : ________________________________________ Signature of the Witness</p>
        <p>1) Shri/Shrimati . ________________________________________ Address ...________________________________________</p>
        <p>2) Shri/Shrimati ________________________________________ Address ________________________________________</p>
        
        <div style="margin-top: 50px; border-top: 2px dashed #000; padding-top: 30px;">
          <p>Place : _________________</p>
          <p>Date : _________________</p>
          <br>
          <p>The Nomination Application was placed in the meeting of the Managing Committee of the society held on _______________.</p>
          <p>And the same was accepted / rejected.</p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
              <p>Date : _________________</p>
            </div>
            <div style="text-align: center;">
              <p>Hon. Secretary</p>
              <br>
              <p><strong>${data.societyName || "(Society Name)"}</strong></p>
            </div>
          </div>
          
          <p style="margin-top: 40px;">Received the Nomination Application duly accepted in duplicate.</p>
          <p style="margin-top: 40px;">________________________________________<br>Signature of the Nomination Member</p>
          <p style="font-size: 12px; margin-top: 10px;">* Strike out which is not applicable.</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="text-align: left; font-weight: bold;">APPENDIX -14<br>(For Society's Record)</p>
        <h2 style="text-align: center; font-size: 18px; margin: 20px 0;">FORM OF NOMINATION APPLICATION<br>TO BE FURNISHED IN TRIPLICATE</h2>
        <p style="text-align: center;">(Under the Bye-Law No. 32)</p>
        
        <div style="margin-bottom: 20px; margin-top: 30px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p>Sir,</p>
        <p>1) ${pProSubj} <strong>${purchaserName}</strong> ${pIsAre} ${pMember} <strong>${data.societyName || "(Society Name)"}</strong> having registered address at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>,</p>
        
        <p>2) ${pProSubj} hold the Share Certificate No. <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, for ten fully paid up share of Rs.50/- each, bearing distinctive numbers from <strong>${data.shareDistinctiveFrom || "(Share Certificate From)"}</strong>, to <strong>${data.shareDistinctiveTo || "(Share Certificate To.)"}</strong>, under <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, issued by the said society to ${pProObj}.</p>
        
        <p>3) ${pProSubj} also hold the at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, in the building of the said society.</p>
        
        <p>4) As provided under Rule 25 of the Maharashtra Co-operative Societies Rules, 1961. ${pProSubj} hereby nominate the person whose particulars are as given below.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;" border="1">
          <tr>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Sr. No.</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Name of the Nominee</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Permanent address of the Nominee</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Relationship with the Nominator</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Share of each Nominees (percentage)</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Date of Birth Of the Nominee if the Nominee Is a Minor</th>
          </tr>
          <tr><td style="padding: 15px; text-align: center;">1)</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px; text-align: center;">2)</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px; text-align: center;">3)</td><td></td><td></td><td></td><td></td><td></td></tr>
        </table>
        
        <p>5) As provided under section 30 of the Maharashtra Co-operative Societies Act. 1960 on ${pProPoss} death, the shares mentioned above should please be transferred to the name of the above mentioned nominee, on his the complying with the provisions of the Bye-laws of the Society for the membership.<br>
        <strong>OR</strong><br>
        6) As provided under section 30 of the Maharashtra Co-operative Societies Act. 1960 and the Bye-laws of the Society, ${pProSubj} state on ${pProPoss} death, the shares mentioned above and ${pProPoss} interest of the flat, the details of which are given above, should be transferred to Mr/Mrs...... the first-named nominee on his/her complying with the provisions of the Bye-laws of the Society regarding requirements of admission to membership, indemnifying the Society, against any claims made to the said shares and ${pProPoss} interest in the said flat by the other Nominee/Nominees.</p>
        
        <p>7) As Mr/Mrs.... the Nominee at Sr. No. ______ is the minor, ${pProSubj} hereby appoint Mr /Mrs..... as the guardian of the minor to represent the minor-nominee in the matters connected with this nomination.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div>
            <p>Place : _________________</p>
            <p>Date : _________________</p>
          </div>
          <div style="text-align: center;">
            <p><strong>${purchaserName}</strong></p>
            <p>Signature of the Nominator ${capitalize(pMember)}</p>
          </div>
        </div>
        
        <p style="margin-top: 40px;"><strong>Witnesses :</strong></p>
        <p>Name and Addresses of Witnesses : ________________________________________ Signature of the Witness</p>
        <p>1) Shri/Shrimati . ________________________________________ Address ...________________________________________</p>
        <p>2) Shri/Shrimati ________________________________________ Address ________________________________________</p>
        
        <div style="margin-top: 50px; border-top: 2px dashed #000; padding-top: 30px;">
          <p>Place : _________________</p>
          <p>Date : _________________</p>
          <br>
          <p>The Nomination Application was placed in the meeting of the Managing Committee of the society held on _______________.</p>
          <p>And the same was accepted / rejected.</p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
              <p>Date : _________________</p>
            </div>
            <div style="text-align: center;">
              <p>Hon. Secretary</p>
              <br>
              <p><strong>${data.societyName || "(Society Name)"}</strong></p>
            </div>
          </div>
          
          <p style="margin-top: 40px;">Received the Nomination Application duly accepted in duplicate.</p>
          <p style="margin-top: 40px;">________________________________________<br>Signature of the Nomination Member</p>
          <p style="font-size: 12px; margin-top: 10px;">* Strike out which is not applicable.</p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="font-weight: bold; text-align: center;">APPENDIX -20(1)</p>
        <p style="text-align: center;">(Under the Bye-law No.38(a)</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">A form of Notice of intention of ${sMemberLabel} to transfer ${sHisTheir} Shares and interest in the Capital/Property of the Society.</p>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px; margin-top: 30px;">
          <div style="text-align: left; width: 350px;">
            <p style="margin: 0;"><strong>${sellerName}</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.sellerAddress || "(SELLER ADDRESS)"}</p>
            <p style="margin-top: 10px;">Dated : _________________</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p style="margin-top: 20px;">Sir,</p>
        <p>${sProSubj} <strong>${sellerName}</strong>, ${sIsAre} the ${sMember} of the at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, and is ten Shares of Rs.50/- each, bearing distinctive numbers from <strong>${data.shareDistinctiveFrom || "(Share Certificate From)"}</strong>, to <strong>${data.shareDistinctiveTo || "(Share Certificate To.)"}</strong>, under Share Certificate No. <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong>, issued in ${sHisTheir} favour by the said Society and the at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, in the building of the society, numbered/known as <strong>${data.societyName || "(Society Name)"}</strong>, hereby give you notice as required under Rule 24 of the Maharashtra Co-operative Societies Rules, 1961, as under.</p>
        
        <p>${sProSubj} <strong>${sellerName}</strong>, intend to transfer ${sProPoss} shares and ${sProPoss} right, title and interest in the Flat in the building of the Society and ${sProPoss} interest in the capital of the society to <strong>${data.societyName || "(Society Name)"}</strong>, for consideration of <strong>${considerationText}</strong></p>
        
        <p>The consent of the ${pTransferee} is enclosed.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div>
            <p>Place : _________________</p>
            <p>Date : _________________</p>
            <br>
            <p>Encl : Consent letter from the ${pTransferee}</p>
          </div>
          <div style="text-align: right;">
            <p>Yours faithfully</p>
            <br><br><br>
            <p><strong>${sellerName}</strong></p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="font-weight: bold; text-align: center;">APPENDIX - 20(2)</p>
        <p style="text-align: center;">[Under the Bye-law No.38 (a)]</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">A form of letter of consent of the proposed ${pTransferee} for the transfer of the shares and interest of the ${sMember} (${sTransferor}) to ${pProObj} (${pTransferee})</p>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px; margin-top: 30px;">
          <div style="text-align: left; width: 350px;">
            <p style="margin: 0;"><strong>${purchaserName}</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.purchaserAddress || "(PURCHASER ADDRESS)"}</p>
            <p style="margin-top: 10px;">Dated : _________________</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p style="margin-top: 20px;">Sir,</p>
        <p><strong>${sellerName}</strong>, ${capitalize(sMember)} at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, proposes to transfer ${sHisTheir} shares and interest in the capital/property of the Society to ${pProObj}.</p>
        
        <p>${pProSubj} hereby give ${pProPoss} consent for the proposed transfer of shares and interest <strong>${purchaserName}</strong>, in the capital/property to ${pProObj} as required under Rule 24(1) {b) of the Maharashtra Co-Operative Housing Societies Rules 1961.</p>
        
        <p>${capitalize(pProPoss)} name and address is as under:<br>
        <strong>${purchaserName}</strong><br>
        <strong>${data.purchaserAddress || "(PURCHASER ADDRESS.)"}</strong></p>
        
        <div style="text-align: right; margin-top: 60px;">
          <p>Yours faithfully</p>
          <br><br><br>
          <p><strong>${purchaserName}</strong></p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="font-weight: bold; text-align: center;">APPENDIX-21</p>
        <p style="text-align: center;">[Under bye-law No.38(e)(i)]</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">Form of application for transfer of shares and interest in the Capital Property of the Society by the Proposed ${sTransferor} (being an ${isMultiSeller ? "individuals" : "individual"})</p>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px; margin-top: 30px;">
          <div style="text-align: left; width: 350px;">
            <p style="margin: 0;"><strong>${sellerName}</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.sellerAddress || "(SELLER ADDRESS)"}</p>
            <p style="margin-top: 10px;">Dated : _________________</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p style="margin-top: 20px;">Sir</p>
        <p>${sProSubj} <strong>${sellerName}</strong>, ${sIsAre} the ${sMember} of the <strong>${data.propertyAddress || "(Full Property Address)"}</strong> and ten Shares of Rs.50/- each, bearing distinctive numbers from <strong>${data.shareDistinctiveFrom || "(Share Certificate From)"}</strong>, to <strong>${data.shareDistinctiveTo || "(Share Certificate To.)"}</strong>, under Share Certificate No. <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong> and holding the at <strong>${data.propertyAddress || "(Full Property Address)"}</strong> the building of the said Society numbered/known as <strong>${data.societyName || "(Society Name)"}</strong>.</p>
        
        <p>2. ${sProSubj} had given you notice of ${sProPoss} intention to transfer the said shares and ${sProPoss} interest in the capital/ property of the Society on________________ as required under Rule 24 (l)(b) of the Maharashtra Co-Operative Societies Rules 1961. along with the consent of the proposed ${pTransferee}.</p>
        
        <p>3. ${sProSubj} enclose herewith the application in the prescribed from for membership of the said society by the proposed ${pTransferee}.</p>
        
        <p>4. ${sProSubj} remit herewith the transfer fee of Rs.500/- (Rupees Five Hundred Only). ${sProSubj} also remit herewith the amount of the premium of Rs.__________________/-(Rupees__________________________________ ONLY), as provided under bye-law No.38 (e)(ix) of the bye-laws of the Society.</p>
        
        <p>5. ${sProSubj} state that the said shares and the interest in the capital/property of the said society have been held by ${sProObj} for a period of not less than a year.</p>
        
        <p>6. ${sProSubj} further state that the liabilities due to the said society by ${sProObj}, as on the date of this application have been fully paid by ${sProObj}. ${sProSubj} also undertake to pay the liabilities which may become due till the transfer application is approved by the Society.</p>
        
        <p>7. ${sProSubj} hereby undertake to discharge any liabilities to the said society, which related to the period of ${sProPoss} memberships with the said society and have become payable by ${sProObj} after cessation of ${sProPoss} memberships due to any demand made by the local authority, Government or by any other authority on any account, after cessation of ${sProPoss} memberships.</p>
        
        <p>8. ${sProSubj} propose to transfer the said shares and ${sProPoss} interest in the capital/property of the said society on the following grounds :<br>
        (i) __________________________________________________________________<br>
        (ii) __________________________________________________________________<br>
        (iii) __________________________________________________________________</p>
        
        <p>9. ${sProSubj} furnish herewith the declaration, in the prescribed form on Rs.10/- stamp paper about non-holding of any vacant land or land with a building in any Urban Agglomeration, specified under the urban land {Ceiling and Regulation)Act 1976, the area of which exceeds 500 Sq. Mtrs.</p>
        
        <p>10. ${sProSubj} also furnish herewith the undertaking in the prescribed form, on Rs.20/- stamp paper, about the registration of the transfer as required under Section 269 AB of the Income-tax Act.</p>
        
        <p>11. ${sProSubj} request you to approve the proposed transfer and inform ${sProObj} accordingly.</p>
        
        <div style="text-align: right; margin-top: 60px;">
          <p>Yours faithfully</p>
          <br><br><br>
          <p><strong>${sellerName}</strong></p>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="font-weight: bold; text-align: center;">APPENDIX-23</p>
        <p style="text-align: center;">[Under bye-law No.38 (e) (ii)]</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">Form of application for membership of the Society by the Proposed ${pTransferee} (being an ${pIndividual})</p>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px; margin-top: 30px;">
          <div style="text-align: left; width: 350px;">
            <p style="margin: 0;"><strong>${purchaserName}</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.purchaserAddress || "(PURCHASER ADDRESS)"}</p>
            <p style="margin-top: 10px;">Dated : _________________</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 0;">To,</p>
          <p style="margin: 0;">The Chairman/Secretary,</p>
          <p style="margin: 0;">${data.societyName || "(Society Name)"}</p>
          <p style="margin: 0; white-space: pre-wrap;">${data.buildingAddress || data.propertyAddress || "(Building Address)"}</p>
        </div>
        
        <p style="margin-top: 20px;">Sir</p>
        <p>${pProSubj} <strong>${purchaserName}</strong>, intend to become a ${pMember} of the <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, by transfer of the ten Shares of Rs.50/- each, bearing distinctive numbers from <strong>${data.shareDistinctiveFrom || "(Share Certificate From)"}</strong>, to <strong>${data.shareDistinctiveTo || "(Share Certificate To.)"}</strong>, under Share Certificate No. <strong>${data.shareCertificateNumber || "(Share Certificate No.)"}</strong> held by <strong>${sellerName}</strong>, the ${sMember} of the said society and their interest in <strong>${data.propertyAddress || "(Full Property Address)"}</strong>,in the building of the said society, numbered known as <strong>${data.societyName || "(Society Name)"}</strong>., held by the said <strong>${sellerName}</strong>, ${capitalize(pProPoss)} name.</p>
        
        <p>2. ${pProSubj} had given ${pProPoss} consent to the Proposed transfer of the said shares and the interest of the said ${sTransferor} in the Capital/Property of the said society to ${pProObj} on ____________</p>
        
        <p>3. ${pProSubj} now make this application for membership of the said society and for transfer of the said shares and the interest of the said ${sTransferor} in the capital/property of the said society to ${pProPoss} name.</p>
        
        <p>4. The particulars for the proposed of consideration of ${pProPoss} application for membership of The <strong>${data.societyName || "(Society Name)"}</strong>. are given below :</p>
        <div style="margin-left: 20px;">
          <p>Age : ---</p>
          <p>Occupation : Business</p>
          <p>Monthly Income : Rs. _________________</p>
          <p>Office Address : __________________________________________________</p>
          <p>Residing at : <strong>${data.purchaserAddress || "(Purchaser Address)"}</strong></p>
        </div>
        
        <p>5. ${pProSubj} remit herewith the entrance fee of Rs. 100/-(Rupees One Hundred Only).</p>
        
        <p>6. ${pProSubj} declare that there is no Flat owned by ${pProObj} of the members of ${pProPoss} family the person dependent on ${pProObj} in the area of the operation of Society.<br>
        <strong>OR</strong><br>
        ${pProSubj} give below the particulars of the Flat owned by ${pProObj} any of the members of ${pProPoss} family the persons dependent on ${pProObj}, in the area of the society.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;" border="1">
          <tr>
            <th style="padding: 5px; font-size: 12px; text-align: center;">S. no</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Name of the person</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Particulars of the plot's/Flat owned by ${pProObj} or ${pProPoss} family the person dependant on ${pProObj} in the area of operation of the Society</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Location of the Plot/Flat house</th>
            <th style="padding: 5px; font-size: 12px; text-align: center;">Reasons us to why it is necessary to have a Flat in this society</th>
          </tr>
          <tr><td style="padding: 15px;"></td><td></td><td></td><td></td><td></td></tr>
          <tr><td style="padding: 15px;"></td><td></td><td></td><td></td><td></td></tr>
        </table>
        
        <p>7. ${pProSubj} furnish herewith the declaration in the prescribed form, on ten Rupees Stamp paper, about non-holding of any vacant land or land with, a building in ${pProPoss} urban agglomeration, specified under the Land (Ceiling and Regulation) Act 1976, the area of which exceeds 500 sq mtrs.</p>
        
        <p>8. ${pProSubj} also furnish herewith the undertaking in the prescribed form, on ten rupees stamp paper, about registration of the transfer under section 269 AB of the Income Tax Act and the Rules made there under.</p>
        
        <p>9. ${pProSubj} undertake to use the Flat proposed to be transferred to ${pProObj}, for the purpose, mentioned in the letter that will be issued to ${pProObj} by the society, under bye-law no.76 (a) of the bye-laws of the said society and that no change of the user of the said Flat will be made by ${pProObj} without the prior approval of the society in writing. The undertaking to that effect in the prescribed form is enclosed herewith.</p>
        
        <p>10. ${pProSubj} undertake to discharge all the liabilities to the society, which may become due from the date of ${pProPoss} admission to the membership of the society. As ${pProSubj} have no independent source of income, ${pProSubj} enclose herewith the undertaking in the prescribed form the person, on whom ${pProSubj} ${pAmAre} dependent, to the effect that he will discharge all liabilities to the society on ${pProPoss} behalf including the charges of the society.</p>
        
        <p>11. ${pProSubj} enclose herewith the undertaking in the prescribed form that the Flat owned by ${pProObj} any of the member of ${pProPoss} family the person dependent on ${pProObj}, the details of which are given in this application, about the disposal of the said Flat.</p>
        
        <p>12. ${pProSubj} have gone through the byelaws of the said society and undertake to abide by the same and any modifications that the Registering Authority may make in them.</p>
        
        <p>13. ${pProSubj} request you to please admit ${pProObj} as a ${pMember} of the said society and transfer the shares and the interest of the ${sTransferor} in the capital property of the said society to ${pProPoss} name.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div>
            <p>Place: _________________</p>
            <p>Date: _________________</p>
          </div>
          <div style="text-align: right;">
            <p>Yours faithfully,</p>
            <br><br><br>
            <p><strong>${purchaserName}</strong></p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <p style="font-weight: bold; text-align: right;">FORM NO. 4</p>
        <h2 style="text-align: center; font-size: 18px; margin: 20px 0;">COMMON</h2>
        <p style="text-align: center;">UNDER BYE LAW NO. 17 (B) AND 19(A)(IV)</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">The Form of Undertaking to be Furnished by the Prospective Member to use the flat for the purpose for which it is allotted</p>
        
        <p style="margin-top: 40px;">${pProSubj} <strong>${purchaserName}</strong>, Intending ${pMember} of the <strong>${data.propertyAddress || "(Full Property Address)"}</strong> hereby give the undertaking that ${pProSubj} will use the Flat to be allotted to ${pProObj} to be acquired by ${pProObj}, on cessation of membership of the earlier ${sMember}, under the Bye laws of the society, for the purpose mentioned in the letter, which will be issued under bye law No. 76 (a) of the Bye laws of the society proposed/registered.</p>
        
        <p>${pProSubj}, further give the undertaking that no change of user will be made by ${pProObj} without the previous permission in writing, of the committee of the society.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 80px;">
          <div>
            <p>PLACE : Navi Mumbai</p>
            <p>DATE : _________________</p>
          </div>
          <div style="text-align: center;">
            <p>Signature</p>
            <br><br>
            <p><strong>${purchaserName}</strong></p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 50px; page-break-after: always;">
        <h2 style="text-align: center; font-size: 18px; margin: 20px 0;">COMMON</h2>
        <p style="text-align: right; font-weight: bold;">Form No. 25</p>
        <p style="text-align: center;">[under the Bye-Law No. 38(e)(xi)]</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">A Form of Declaration for not holding immovable property (in any Urban Agglomeration, specified under the urban (celling and Regulation ) Act 1976, exceeding 500 sq. mtrs.</p>
        <p style="text-align: center;">(To be given by the ${sTransferor})</p>
        
        <p style="margin-top: 40px;">${sProSubj} <strong>${sellerName}</strong>, a ${sMember} of <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, in the building of the Society and intending to transfer to <strong>${purchaserName}</strong>, intending ${pMember} of the society, hereby declare that ${sProSubj} do not hold any vacant land with a building thereon, anywhere in urban agglomeration, mentioned in the Urban Land (ceiling and Regulation) Act, 1976, the area of which, exceeds 38.88 Sq. Mtrs. Built up Area.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 80px;">
          <div>
            <p>PLACE : _________________</p>
            <p>DATE : _________________</p>
          </div>
          <div style="text-align: center;">
            <p>Signature of the ${sTransferor}</p>
            <br><br><br>
            <p><strong>${sellerName}</strong></p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 50px;">
        <h2 style="text-align: center; font-size: 18px; margin: 20px 0;">COMMON</h2>
        <p style="text-align: right; font-weight: bold;">Form no 26</p>
        <p style="text-align: center;">[under the Bye-law No.17(b),19A(vii),19C(iv)and 38(e)(xi)]</p>
        <p style="text-align: center; font-weight: bold; margin-top: 20px;">A From of Declaration for not holding immoveable property in any Urban Agglomeration, specified under the urban Land (Ceiling and Regulation) Act,1976, exceeding 500 sq.mtrs.</p>
        <p style="text-align: center;">(To be given by the ${pTransferee} / ${pPerson} seeking admission to membership of the society )</p>
        
        <p style="margin-top: 40px;">${pProSubj}, <strong>${purchaserName}</strong> Intending ${pMember} of at <strong>${data.propertyAddress || "(Full Property Address)"}</strong>, in the building of the said society hereby declare that ${pProSubj} do not hold any vacant land or land with a building thereon, anywhere in Urban agglomeration, mentioned in the Urban Land (Ceiling and Regulation) Act, 1976, the area of which, exceeds 38.88 Sq. Mtrs. Built up Area.</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 80px;">
          <div>
            <p>PLACE : Koparkhairane, Navi Mumbai</p>
            <p>DATE : _________________</p>
          </div>
          <div style="text-align: center;">
            <p>Signature of the ${pTransferee} - Prospective ${capitalize(pMember)}</p>
            <br><br><br>
            <p><strong>${purchaserName}</strong></p>
          </div>
        </div>
      </div>

    </div>
  `;
};
