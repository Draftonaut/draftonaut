import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import html2pdf from "html2pdf.js";
import logo from "../assets/logoblue.png";

// =========================================================================
// HTML GENERATOR FOR MOU
// =========================================================================
const renderPartiesHTML = (parties, address, inhabitantText) => {
  if (!parties || parties.length === 0) return "";
  let partyString = "";
  parties.forEach((party, index) => {
    const prefix = party.title ? `${party.title} ` : "";
    const separator =
      index === parties.length - 1
        ? ""
        : index === parties.length - 2
          ? ", & "
          : ", ";
    partyString += `${index + 1}) ${prefix}${party.fullName}, aged ${party.age} years, having (Pan No. ${party.panCard})${separator}`;
  });
  return `${partyString}, ${inhabitantText}, residing at ${address}`;
};

const generateMouHTML = (data) => {
  const sellerTitle = data.grammar?.sellerTitle || "TRANSFEROR/SELLER";
  const purchaserTitle = data.grammar?.purchaserTitle || "TRANSFEREE/PURCHASER";
  const sellerPronounTheir = data.grammar?.sellerPronounTheir || "their";
  const sellerPronounThey = data.grammar?.sellerPronounThey || "they";
  const purchaserPronounTheir = data.grammar?.purchaserPronounTheir || "their";
  const purchaserPronounThey = data.grammar?.purchaserPronounThey || "they";

  // CONDITIONAL PAYMENT CLAUSES
  let paymentClausesHTML = "";

  // 1. TOKEN AMOUNT
  if (data.financials?.tokenAmount) {
    if (data.financials.tokenMode === "Cash") {
      paymentClausesHTML += `
      <li style="margin-bottom: 10px;">
        A sum of <strong>Rs. ${data.financials.tokenAmount}/- (Rupees ${data.financials.tokenAmountWords})</strong> shall be 
        paid by Cash as a token Amount.
      </li>`;
    } else {
      paymentClausesHTML += `
      <li style="margin-bottom: 10px;">
        A sum of <strong>Rs. ${data.financials.tokenAmount}/- (Rupees ${data.financials.tokenAmountWords})</strong> shall be 
        paid by ${data.financials.tokenMode || "Cheque"} No. ${data.financials.chequeNo || "_______"}, Dated ${data.financials.formattedChequeDate || "_______"} Drawn on 
        ${data.financials.bankName || "_______"} as a token Amount.
      </li>`;
    }
  }

  // 2. PART PAYMENTS
  if (data.partPayments && data.partPayments.length > 0) {
    data.partPayments.forEach((p) => {
      const timingWord = p.timing === "After Execution" ? "after" : "before";
      let paymentString = "";

      if (p.mode === "Cash") {
        paymentString = `paid by Cash on or ${timingWord} execution of part payment Registration.`;
      } else {
        const modeStr = p.mode ? `by ${p.mode}` : "by Cheque/Rtgs";
        const refStr = p.refNo ? ` No. ${p.refNo}` : "";
        const bankStr = p.bank ? `, Drawn on ${p.bank}` : "";
        paymentString = `paid ${modeStr}${refStr}${bankStr} on or ${timingWord} execution of part payment Registration.`;
      }

      paymentClausesHTML += `
        <li style="margin-bottom: 10px;">
          A sum of <strong>Rs. ${p.amount}/- (Rupees ${p.amountWords})</strong> shall be 
          ${paymentString}
        </li>`;
    });
  }

  // 3. FULL & FINAL PAYMENT
  if (data.financials?.fullFinalAmount) {
    const timingWord =
      data.financials.fullFinalTiming === "After Execution"
        ? "after"
        : "before";
    let paymentString = "";

    if (data.financials.fullFinalMode === "Cash") {
      paymentString = `paid by Cash on or ${timingWord} execution of Full and Final payment Registration.`;
    } else {
      const modeStr = data.financials.fullFinalMode
        ? `by ${data.financials.fullFinalMode}`
        : "by Cheque/Rtgs";
      const refStr = data.financials.fullFinalRefNo
        ? ` No. ${data.financials.fullFinalRefNo}`
        : "";
      const bankStr = data.financials.fullFinalBank
        ? `, Drawn on ${data.financials.fullFinalBank}`
        : "";
      paymentString = `paid ${modeStr}${refStr}${bankStr} on or ${timingWord} execution of Full and Final payment Registration.`;
    }

    paymentClausesHTML += `
      <li style="margin-bottom: 10px;">
        A sum of <strong>Rs. ${data.financials.fullFinalAmount}/- (Rupees ${data.financials.fullFinalAmountWords})</strong> shall be 
        ${paymentString}
      </li>`;
  }

  // 4. CASH PAYMENTS
  if (data.cashPayments && data.cashPayments.length > 0) {
    data.cashPayments.forEach((c) => {
      const timingWord = c.timing === "After Execution" ? "after" : "before";
      paymentClausesHTML += `
        <li style="margin-bottom: 10px;">
          A sum of <strong>Rs. ${c.amount}/- (Rupees ${c.amountWords})</strong> shall be 
          paid by Cash, on or ${timingWord} execution of part payment Registration.
        </li>`;
    });
  }

  // 5. LOAN
  if (data.financials?.loanBalanceAmount) {
    paymentClausesHTML += `
      <li style="margin-bottom: 10px;">
        The balance consideration amount of <strong>Rs. ${data.financials.loanBalanceAmount}/- (Rupees ${data.financials.loanBalanceAmountWords})</strong> 
        on receipt of Housing Loan amount from any Bank/Financial Institution/s and/or in any case within 
        <strong> ${data.financials.loanTimeframeDays || "____"} days</strong> from the date of Execution of this MOU.
      </li>`;
  }

  // 6. TDS
  if (data.financials?.tdsAmount) {
    paymentClausesHTML += `
      <li style="margin-bottom: 10px;">
        The ${purchaserTitle} has deducted the sum of <strong>Rs. ${data.financials.tdsAmount}/- (Rupees ${data.financials.tdsAmountWords})</strong> 
        from the total sale price consideration and have paid to the Income Tax Department, being the T.D.S. (Tax Deduction at Source) of 1% of the 
        Agreement Value, as applicable under the provisions of Section-194 IA, of the Income Tax Act, 1961, on or before the date of 
        Registration and a Challan-Cum-Statement shall be furnished to the ${sellerTitle} herein.
      </li>`;
  }

  // CONDITIONAL MORTGAGE HTML
  const mortgageHTML = data.mortgage?.isMortgaged
    ? `
      <li style="margin-bottom: 10px;">
        The ${sellerTitle} have mortgaged the said Flat with ${data.mortgage.bankName}, under Loan Account 
        No. ${data.mortgage.loanAcc}. The ${sellerTitle} hereby declare that an outstanding loan amount of 
        <strong> Rs. ${data.mortgage.outstandingAmount}/- (Rupees ${data.mortgage.outstandingWords})</strong> Approx is payable 
        to the said ${data.mortgage.bankName} as on date.
      </li>
      <li style="margin-bottom: 10px;">
        The ${sellerTitle} hereby undertakes and agrees that it shall be ${sellerPronounTheir} sole 
        responsibility to fully repay and liquidate the aforesaid loan, obtain a No Due Certificate/Loan Closure Certificate from 
        ${data.mortgage.bankName} and cause the mortgage to be released. Upon closure of the said loan, the ${sellerTitle} 
        shall hand over all original title deeds and property documents pertaining to the said Flat to the Advocate of the 
        ${purchaserTitle} for safe custody, free from all encumbrances.
      </li>
    `
    : "";

  // CONDITIONAL BROKERAGE HTML
  let brokerageClauses = "";
  if (data.brokerage?.showBrokerage) {
    if (data.brokerage.sellerBrokerName) {
      brokerageClauses += `
      <li style="margin-bottom: 15px;">
        It is hereby agreed by the ${sellerTitle} that ${sellerPronounThey} shall pay brokerage at the rate 
        of ${data.brokerage.sellerBrokerPercent || "___"} of the transaction value to ${sellerPronounTheir} respective agent, 
        <strong> ${data.brokerage.sellerBrokerName}</strong>. Out of the said brokerage, 1% shall be paid at the time of part 
        registration, and the remaining 1% shall be paid at the time of execution of the Full and Final Payment Registration.
      </li>`;
    }
    if (data.brokerage.purchaserBrokerName) {
      brokerageClauses += `
      <li style="margin-bottom: 15px;">
        It is hereby agreed by the ${purchaserTitle} that ${purchaserPronounThey} shall pay brokerage at the 
        rate of ${data.brokerage.purchaserBrokerPercent || "___"} of the transaction value to ${purchaserPronounTheir} respective 
        agent, <strong> ${data.brokerage.purchaserBrokerName}</strong>. Out of the said brokerage, 1% shall be paid at the time of 
        part registration, and the remaining 1% shall be paid at the time of execution of the Full and Final Payment Registration.
      </li>`;
    }
  }

  // Generate Sellers Signature Block
  let sellersSigsHTML = "";
  if (data.sellers && data.sellers.length > 0) {
    data.sellers.forEach((s, i) => {
      const title = s.title ? s.title.toUpperCase() : "";
      const name = s.fullName ? s.fullName.toUpperCase() : "";
      sellersSigsHTML += `<p style="font-weight: bold; margin-bottom: 10px;">${i + 1})${title} ${name}</p>`;
      if (i < data.sellers.length - 1) {
        sellersSigsHTML += `<p style="font-weight: bold; margin-bottom: 10px;">And</p>`;
      }
    });
  }

  // Generate Purchasers Signature Block
  let purchasersSigsHTML = "";
  if (data.purchasers && data.purchasers.length > 0) {
    data.purchasers.forEach((p, i) => {
      const title = p.title ? p.title.toUpperCase() : "";
      const name = p.fullName ? p.fullName.toUpperCase() : "";
      const comma = i < data.purchasers.length - 1 ? "," : "";
      purchasersSigsHTML += `<p style="font-weight: bold; margin-bottom: 10px;">${i + 1})${title} ${name}${comma}</p>`;
      if (i < data.purchasers.length - 1) {
        purchasersSigsHTML += `<p style="margin-bottom: 10px;">&</p>`;
      }
    });
  }

  // Generate receipt specific signature lines (with physical lines)
  let receiptSellersSigs =
    data.sellers
      ?.map(
        (s, i) =>
          `<p style="margin-bottom: 25px;">________________________________<br/>${i + 1}) ${s.title} ${s.fullName}</p>`,
      )
      .join("") || "";

  let purchasersList =
    data.purchasers
      ?.map(
        (p, i) =>
          `<p style="text-align: center; font-weight: bold; margin-bottom: 5px;">${i + 1}) ${p.title} ${p.fullName}</p>`,
      )
      .join("") || "";

  // CONDITIONAL RECEIPT PAGE (Only shows if Token Amount exists)
  let receiptPaymentDetails = "";
  if (data.financials?.tokenMode === "Cash") {
    receiptPaymentDetails = "paid by Cash as a token Amount";
  } else {
    receiptPaymentDetails = `paid by ${data.financials?.tokenMode || "Cheque"} No. ${data.financials?.chequeNo || "_______"}, Dated ${data.financials?.formattedChequeDate || "_______"} Drawn on ${data.financials?.bankName || "_______"} as a token Amount`;
  }

  const receiptHTML = data.financials?.tokenAmount
    ? `
    <div style="page-break-before: always;"></div>
    <h2 style="text-align: center; font-size: 16pt; font-weight: bold; text-decoration: underline; margin-top: 50px; margin-bottom: 30px;">RECEIPT</h2>
    
    <p style="margin-bottom: 40px;">
      RECEIVED WITH thanks a sum of <strong>Rs. ${data.financials.tokenAmount}/- (Rupees ${data.financials.tokenAmountWords})</strong> 
      ${receiptPaymentDetails}, being towards the Part Payment for sale of Flat No. <strong>${data.property?.flatNo}</strong>, in the society known as 
      <strong> '${data.property?.societyName}'</strong> situated at <strong>${data.property?.fullAddress}</strong>, 
      (hereinafter referred the "Said Flat") from the within named ${purchaserTitle}:
    </p>

    ${purchasersList}

    <div style="text-align: center; margin-top: 50px; margin-bottom: 50px;">
      <p style="font-weight: bold; margin-bottom: 15px; letter-spacing: 2px;">WE SAY RECEIVED</p>
      <p style="font-size: 14pt; font-weight: bold; border: 2px solid black; display: inline-block; padding: 10px 20px;">
        Rs. ${data.financials.tokenAmount}/-
      </p>
    </div>

    <table style="width: 100%; border: none;">
      <tr>
        <td style="width: 50%; border: none;"></td>
        <td style="width: 50%; text-align: right; border: none;">
          ${receiptSellersSigs}
          <p style="font-weight: bold;">(The ${sellerTitle})</p>
        </td>
      </tr>
    </table>

    <div style="margin-top: 40px;">
      <p style="font-weight: bold; margin-bottom: 25px;">WITNESSES:</p>
      <p style="margin-bottom: 30px;">1. ________________________________</p>
      <p>2. ________________________________</p>
    </div>
  `
    : "";

  return `
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; text-align: justify;">
      <h1 style="text-align: center; text-decoration: underline; font-size: 16pt; font-weight: bold; margin-bottom: 10px;">
        MEMORANDUM OF UNDERSTANDING
      </h1>
      <div style="text-align: center; font-weight: bold; margin-bottom: 30px;">
        
      </div>

      <p style="margin-bottom: 20px;">
        THIS MEMORANDUM OF UNDERSTANDING is made and entered into at <strong>${data.execution?.place || "________________"}</strong> 
        on this <strong>${data.execution?.date || "________________"}</strong>.
      </p>

      <div style="text-align: center; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px;">BETWEEN</div>

      <p style="margin-bottom: 20px;">
        <strong>${renderPartiesHTML(data.sellers, data.sellerAddress, data.grammar?.sellerInhabitantText)}</strong>, 
        hereinafter for brevity's sake called the <strong>'${sellerTitle}'</strong> (which expression shall, 
        unless it be repugnant to the context or meaning thereof be deemed to mean and include ${sellerPronounTheir} heirs, 
        executors and administrators, legal representatives and assigns) of the <strong>ONE PART</strong>.
      </p>

      <div style="text-align: center; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px;">AND</div>

      <p style="margin-bottom: 30px;">
        <strong>${renderPartiesHTML(data.purchasers, data.purchaserAddress, data.grammar?.purchaserInhabitantText)}</strong>, 
        hereinafter for brevity's sake called the <strong>'${purchaserTitle}'</strong> (which expression shall, 
        unless repugnant to the context or meaning thereof be deemed to mean and include ${purchaserPronounTheir} heirs, 
        executors, administrators legal representatives and assigns) of the <strong>OTHER PART</strong>.
      </p>

      <p style="margin-bottom: 15px;"><strong>WHEREAS:</strong></p>
      
      <p style="margin-bottom: 15px;">
        The ${sellerTitle} are the owners and otherwise well and sufficiently entitled to a residential 
        Flat No. <strong>${data.property?.flatNo || "____"}</strong>, in the society known as 
        <strong> '${data.property?.societyName || "____________________"}'</strong> situated at 
        <strong> ${data.property?.fullAddress || "________________________________________"}</strong>, 
        (hereinafter referred the "Said Flat").
      </p>

      <p style="margin-bottom: 15px;">
        Pursuant to the negotiations between the parties hereto the ${sellerTitle} have agreed to sell the said Flat 
        along with all other rights and benefits attached to the said Flat to the ${purchaserTitle} and the 
        ${purchaserTitle} have agreed to purchase the said Flat from the ${sellerTitle} on the terms 
        and conditions mutually agreed to between them and mentioned herein below:
      </p>

      <p style="margin-bottom: 15px;"><strong>AND WHEREAS : -</strong></p>
      <p style="margin-bottom: 15px;">
        The ${purchaserTitle} being in need of a residential purpose requested the ${sellerTitle}, 
        to transfer all the rights, title and interest in respect of the said Flat and ${sellerTitle} 
        agreed to transfer ${sellerPronounTheir} interest, title benefit in respect of the said Flat in the favour of 
        the ${purchaserTitle}, Hence this M.O.U.
      </p>

      <p style="margin-bottom: 15px;"><strong>AND WHEREAS:-</strong></p>
      <p style="margin-bottom: 30px;">
        The parties hereto are desirous of entering into a Memorandum Of Understanding (MOU) to record the same being these presents.
      </p>

      <p style="margin-bottom: 20px; font-weight: bold; text-transform: uppercase;">
        NOW THESE PRESENTS WITNESSETH AND IT IS HEREBY AGREED BY AND BETWEEN THE PARTIES HERETO AS UNDER:
      </p>

      <ol style="margin-bottom: 30px; padding-left: 25px;">
        <li style="margin-bottom: 15px;">
          The ${sellerTitle} hereby state represent and declare that :
          <ol type="a" style="margin-top: 10px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">
              The ${sellerTitle} are the owners of the said Flat and have got clear and marketable title thereto free 
              from all encumbrances, charges, claims and demands of any nature whatsoever and that the ${sellerTitle} 
              have not done any act, deed, matter or thing whereby ${sellerPronounThey} are prevented from entering 
              into this MOU on the terms and conditions stated herein in favour of the ${purchaserTitle}.
            </li>
            <li style="margin-bottom: 10px;">
              The ${sellerTitle} alone are in exclusive use, enjoyment, occupation and possession of the said Flat as the 
              owner thereof and have full power and absolute authority to sell, convey and transfer the said Flat to the 
              ${purchaserTitle} on ownership basis.
            </li>
            <li style="margin-bottom: 10px;">
              The ${sellerTitle} have not agreed to sell, transfer, alienate or encumber the said Flat or any part 
              thereof and have not entered into any agreement orally or in writing to sell, transfer, alienate or encumber the said 
              Flat or any part thereof to or in favour of any person whomsoever other than the ${purchaserTitle} herein.
            </li>
            <li style="margin-bottom: 10px;">
              The ${sellerTitle} have not received any token money, earnest money or any amount whatsoever from any person 
              whomsoever in respect of the said Flat other than the ${purchaserTitle} herein.
            </li>
            <li style="margin-bottom: 10px;">
              The said Flat is not the subject matter of any pending suit or attachment before or after judgment of any court of Law 
              or Authority for recovery of any debt, decreetal amount, Income tax, Gift Tax or any other amount by way of taxes 
              and/or penalties thereon.
            </li>
            <li style="margin-bottom: 10px;">
              There are no subsisting orders of injunction or appointment of Court Receiver on the said Flat or any part thereof 
              issued by any Court of Law or other Authority.
            </li>
          </ol>
        </li>

        <li style="margin-bottom: 15px;">
          The ${purchaserTitle} hereby agrees to purchase and acquire from the ${sellerTitle} and the 
          ${sellerTitle} hereby agrees to sell and transfer unto the ${purchaserTitle} the said Flat along 
          with the entire right title and interest of the ${sellerTitle} in the said Flat for a total consideration of 
          <strong> Rs. ${data.property?.totalConsideration || "____"}/- (Rupees ${data.financials?.totalConsiderationWords || "____"})</strong>.
        </li>

        <li style="margin-bottom: 15px;">
          Consideration Registration Agreement of <strong>Rs. ${data.financials?.regConsideration || "____"}/- (Rupees ${data.financials?.regConsiderationWords || "____"})</strong>.
          
          <p style="margin-top: 15px; font-weight: bold; text-decoration: underline;">PAYMENT TO BE MADE BY CHEQUE/RTGS/CASH :-</p>
          <ol type="i" style="margin-top: 10px; padding-left: 20px;">
            ${paymentClausesHTML}
          </ol>
        </li>

        ${mortgageHTML}

        <li style="margin-bottom: 15px;">
          The ${sellerTitle} SHALL SIGN THE FINAL Sale Deed and get it registered along with the ${purchaserTitle} 
          at the time of full and final payment of consideration towards the Flat.
        </li>
        <li style="margin-bottom: 15px;">
          The ${sellerTitle} shall provide all the chain of documents to the ${purchaserTitle}.
        </li>
        <li style="margin-bottom: 15px;">
          The ${sellerTitle} do hereby agrees to pay the following dues till the handing over physical possession of the said Flat :-
          <ol type="i" style="margin-top: 10px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Pay the Electricity Bill / Mahanagar Gas Bill / Maintenance Bill till date.</li>
            <li style="margin-bottom: 8px;">Society any other Outstanding Charges shall be paid by ${sellerTitle}.</li>
            <li style="margin-bottom: 8px;">Society Sale NOC/Transfer Charges shall be borne and paid by both the parties in equal shares, i.e, 50% each.</li>
          </ol>
        </li>
        <li style="margin-bottom: 15px;">
          The ${sellerTitle} shall deliver the vacant peaceful and physical possession of the said flat and all other relevant 
          document/s in respect of the flat to the ${purchaserTitle} on getting the full and final consideration.
        </li>
        <li style="margin-bottom: 15px;">
          All costs/charges related to the Stamp Duty, Registration charges etc for this Agreement as well as the final Deed of Assignment 
          will be borne by the ${purchaserTitle}.
        </li>
        <li style="margin-bottom: 15px;">
          It is hereby agreed by and between the parties hereto that the sale transaction shall be completed on or before 
          <strong> ${data.brokerage?.formattedDeadline || "________________"}</strong>.
        </li>
        ${brokerageClauses}
      </ol>

      <p style="margin-bottom: 40px;">
        IN WITNESS WHEREOF, the parties hereto have hereunto set and subscribed their respective hands on the day and the year hereinabove written.
      </p>

      <div style="margin-bottom: 40px;">
        <p style="margin-bottom: 10px;">SIGNED AND SEALED AND DELIVERED BY THE</p>
        <p style="margin-bottom: 10px;">Withinnamed <strong>${sellerTitle}</strong></p>
        ${sellersSigsHTML}
        <p style="margin-bottom: 10px;">in the presence of ...........</p>
        <p style="margin-bottom: 30px;">1.</p>
        <p style="margin-bottom: 30px;">2.</p>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="margin-bottom: 10px;">SIGNED AND DELIVERED BY THE</p>
        <p style="margin-bottom: 10px;">withinnamed <strong>${purchaserTitle}</strong></p>
        ${purchasersSigsHTML}
        <p style="margin-bottom: 10px;">In the presence of</p>
        <p style="margin-bottom: 30px;">1.</p>
        <p style="margin-bottom: 30px;">2.</p>
      </div>

      ${receiptHTML}

    </div>
  `;
};

// =========================================================================
// MAIN PREVIEW COMPONENT
// =========================================================================
function MouTemplate() {
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState("");
  const [pageSize, setPageSize] = useState("a4");
  const [isHintOpen, setIsHintOpen] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("generatedMouData");
    if (storedData) {
      const data = JSON.parse(storedData);
      const generatedHtml = generateMouHTML(data);
      setEditorContent(generatedHtml);
    } else {
      alert("No MOU data found! Please fill out the form first.");
      navigate("/mou");
    }
  }, [navigate]);

  const handleDownloadPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = editorContent;

    const options = {
      margin: 0.5,
      filename: `Memorandum_of_Understanding.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: pageSize, orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  const handleDownloadDOCX = () => {
    const isA4 = pageSize === "a4";
    const sizeStr = isA4 ? "8.27in 11.69in" : "8.5in 14.0in";

    const header = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Memorandum of Understanding</title>
        <style>
          @page WordSection1 {
            size: ${sizeStr};
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
            mso-paper-source: 0;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt; 
            line-height: 1.5; 
            color: #000000; 
          }
          p {
            margin-top: 0;
            margin-bottom: 10pt;
          }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid black; padding: 5px; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
    `;

    const footer = "</div></body></html>";
    const sourceHTML = header + editorContent + footer;

    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Memorandum_of_Understanding.doc`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-100 overflow-hidden relative">
      <div className="md:hidden w-full bg-white shadow-sm flex items-center justify-between py-3 px-4 border-b border-slate-200 shrink-0 z-20">
        <img src={logo} alt="Logo" className="h-8 object-contain" />
        <button
          onClick={() => setIsHintOpen(true)}
          className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded"
        >
          💡 Hints
        </button>
      </div>

      <div className="w-full md:w-65 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col shrink-0 z-10 shadow-sm md:shadow-none overflow-y-auto max-h-48 md:max-h-full">
        <div className="hidden md:block mb-8">
          <img
            src={logo}
            alt="Logo"
            className="h-15 object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <h2 className="text-sm md:text-lg font-bold mb-3 md:mb-6 text-slate-400 uppercase tracking-wider">
          DOCUMENTS
        </h2>

        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
          <button className="whitespace-nowrap md:whitespace-normal text-left p-3 border rounded transition-colors text-sm bg-[#0055ff] border-[#0055ff] text-white font-bold shadow-md">
            Memorandum of Understanding
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-[#f3f4f6]">
        <div className="w-full max-w-204 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 shadow-sm rounded-lg border border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <h3 className="text-base md:text-lg font-bold text-slate-800">
                Memorandum of Understanding
              </h3>
            </div>

            <div className="flex gap-2 w-full sm:w-auto items-center">
              <button
                onClick={() => setIsHintOpen(true)}
                className="hidden md:block lg:hidden px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-bold text-xs md:text-sm transition-colors border border-slate-300"
              >
                💡 Hints
              </button>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm font-bold text-slate-700 outline-none focus:border-[#0055ff] transition-colors cursor-pointer"
              >
                <option value="a4">A4 Size</option>
                <option value="legal">Legal Size</option>
              </select>

              <button
                onClick={handleDownloadPDF}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold text-xs md:text-sm transition-colors shadow-sm"
              >
                PDF
              </button>
              <button
                onClick={handleDownloadDOCX}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#0055ff] text-white rounded hover:bg-blue-700 font-bold text-xs md:text-sm transition-colors shadow-sm"
              >
                Word
              </button>
            </div>
          </div>

          <div
            className="w-full bg-white shadow-2xl ring-1 ring-slate-900/5 sm:mx-auto transition-all duration-300"
            style={{ maxWidth: pageSize === "legal" ? "816px" : "794px" }}
          >
            {editorContent ? (
              <Editor
                key="mou-editor"
                apiKey="xxn6qkavv3x208h2dmjgvoqsu3jb31b114sqz4mk7uq49xag"
                initialValue={editorContent}
                onEditorChange={(newValue) => setEditorContent(newValue)}
                init={{
                  license_key: "gpl",
                  height: pageSize === "legal" ? 1000 : 900,
                  menubar: false,
                  statusbar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic underline | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist | " +
                    "table | removeformat",
                  content_style: `
                    body { 
                      font-family: 'Times New Roman', Times, serif; 
                      font-size: 12pt; 
                      line-height: 1.5;
                      padding: 48px; 
                      color: #000;
                      background: #fff;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { border: 1px solid black; padding: 5px; }
                    @media (max-width: 600px) {
                      body { padding: 20px; }
                    }
                  `,
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <p className="text-lg font-medium animate-pulse">
                  Generating Document...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isHintOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsHintOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 right-0 z-40 w-70 lg:w-[320px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 lg:shadow-none
        ${isHintOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-xl">💡</span>
            <h2 className="font-extrabold text-sm uppercase tracking-wide">
              Document Guide
            </h2>
          </div>
          <button
            onClick={() => setIsHintOpen(false)}
            className="lg:hidden text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h3 className="font-bold text-amber-800 text-sm mb-2">
              Important Review
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Please double-check all dynamic variables inserted into this
              document. Ensure that the <strong>PAN numbers</strong>,{" "}
              <strong>Distinctive Share Numbers</strong>, and{" "}
              <strong>Consideration Amounts</strong> match your official records
              before downloading.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-100 pb-2">
              Formatting Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-xs text-slate-600">
                  Use the <strong className="text-slate-800">Toolbar</strong>{" "}
                  above the document to fix any alignment issues.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-xs text-slate-600">
                  If text is cut off, ensure you haven't accidentally inserted a
                  wide table. The document acts as a standard page.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-xs text-slate-600">
                  You can freely type directly into the document to add custom
                  clauses before downloading.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MouTemplate;
