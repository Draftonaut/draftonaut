import { useEffect, useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { auth } from "../firebase";
import html2pdf from "html2pdf.js";

// IMPORT YOUR ASSETS HERE (Adjust filenames as needed)
import bgImage from "../assets/agreementbg.png";
import logoImage from "../assets/logoblue.png";

// 100% FREE LOCAL TINYMCE IMPORTS
import "tinymce/tinymce";
import "tinymce/models/dom";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin.css";

// PLUGINS (Removed "help" to fix the 404 console error)
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/preview";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/pagebreak";

// =========================================================================
// FORMATTING ENGINE
// =========================================================================

const generatePartyFormats = (parties) => {
  if (!parties || parties.length === 0) return null;

  const validParties = parties.filter(
    (p) => p.fullName && p.fullName.trim() !== "",
  );

  if (validParties.length === 0) return null;

  const formatName = (p) =>
    `${p.title ? p.title.toUpperCase() + " " : ""}${p.fullName.toUpperCase()}`.trim();

  const formatNameWithPan = (p) =>
    `${formatName(p)} (PAN NO. ${p.panCard || ""})`;

  const formatFullDetails = (p, index) => {
    let prefix = validParties.length > 1 ? `${index + 1}) ` : "";
    return `${prefix}<strong>${formatName(p)}</strong> aged ${
      p.age || "N/A"
    } years, <strong>(PAN NO. ${p.panCard || "N/A"})</strong>`;
  };

  const buildBlock = (formatFn) => {
    if (validParties.length === 1) {
      return formatFn(validParties[0], 0);
    }
    const allButLast = validParties.slice(0, -1).map((p, i) => formatFn(p, i));
    const last = formatFn(
      validParties[validParties.length - 1],
      validParties.length - 1,
    );
    return `${allButLast.join(" and ")} & ${last}`;
  };

  const buildInline = (formatFn) => {
    if (validParties.length === 1) {
      return formatFn(validParties[0]);
    }
    if (validParties.length === 2) {
      return `${formatFn(validParties[0])} & ${formatFn(validParties[1])}`;
    }
    const allButLast = validParties.slice(0, -1).map(formatFn);
    const last = formatFn(validParties[validParties.length - 1]);
    return `${allButLast.join(", ")} & ${last}`;
  };

  return {
    fullDetailsBlock: buildBlock(formatFullDetails),
    namesOnlyBlock: buildBlock((p) => formatName(p)),
    namesWithPanBlock: buildBlock(formatNameWithPan),
    inlineNames: buildInline(formatName),
    inlineNamesWithPan: buildInline(formatNameWithPan),
  };
};

// Helper function to safely strip commas and convert to number to fix the "63,00,000" parsing error
const parseSafeNumber = (val) => {
  if (!val) return 0;
  const cleanVal = String(val).replace(/,/g, "");
  const num = Number(cleanVal);
  return isNaN(num) ? 0 : num;
};

function GenerateAgreement() {
  const [agreement, setAgreement] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const editorRef = useRef(null);

  // =========================================================================
  // CHATBOT STATE & LOGIC
  // =========================================================================
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your Clause Assistant. How can I help you refine this agreement today?",
    },
  ]);
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (textOverride = null, prefix = "") => {
    const textToSend = textOverride || chatInput;
    if (!textToSend.trim()) return;

    // 1. Add User Message to the chat window
    const userMsg = { sender: "user", text: prefix + textToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // 2. Add a temporary "Thinking..." message
    const loadingMsg = { sender: "bot", text: "Thinking...", isLoading: true };
    setChatMessages((prev) => [...prev, loadingMsg]);

    try {
      // 3. Make the ACTUAL API call to your backend server
      const response = await axios.post("http://localhost:5000/api/ai-clause", {
        prompt: prefix + textToSend,
      });

      // 4. Remove the "Thinking..." message and display the AI's response
      const botMsg = { sender: "bot", text: response.data.reply };
      setChatMessages((prev) =>
        prev.filter((msg) => !msg.isLoading).concat(botMsg),
      );
    } catch (error) {
      console.error("AI API Error:", error);
      // Fallback error message if the server fails
      const errorMsg = {
        sender: "bot",
        text: "Sorry, I couldn't connect to the AI server. Please check if your backend is running.",
      };
      setChatMessages((prev) =>
        prev.filter((msg) => !msg.isLoading).concat(errorMsg),
      );
    }
  };

  const handleQuickAction = (actionType) => {
    const selectedText =
      editorRef.current?.selection?.getContent({ format: "text" }) ||
      "Selected text...";

    if (!selectedText || selectedText === "Selected text...") {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Please select some text in the editor first before using this action, or type your request below.",
        },
      ]);
      return;
    }

    if (actionType === "rephrase") {
      handleSendMessage(selectedText, "Rephrase this clause: ");
    } else if (actionType === "grammar") {
      handleSendMessage(selectedText, "Correct the grammar for: ");
    }
  };

  // =========================================================================
  // EXPORT FUNCTIONS
  // =========================================================================

  const exportToWord = () => {
    // Wrap the HTML so MS Word recognizes it as a document
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Agreement</title></head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + agreement + postHtml;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, "Agreement.doc");
    } else {
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = "Agreement.doc";
      downloadLink.click();
      URL.revokeObjectURL(url);
    }
    document.body.removeChild(downloadLink);
  };

  const exportToPDF = () => {
    // Create a temporary element to hold the agreement HTML for formatting
    const element = document.createElement("div");
    element.innerHTML = agreement;

    // Apply baseline styles to match the editor look in the PDF
    element.style.padding = "40px";
    element.style.fontFamily = "Cambria, Georgia, serif";
    element.style.fontSize = "14pt";
    element.style.lineHeight = "1.5";
    element.style.color = "#000";

    const opt = {
      margin: 0.5,
      filename: "Agreement.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: pageSize === "A4" ? "a4" : "legal",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  // =========================================================================
  // SAVE DRAFT
  // =========================================================================

  const saveDraft = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        return;
      }

      const agreementForm = JSON.parse(
        localStorage.getItem("agreementForm") || "{}",
      );

      const ownershipHistory = localStorage.getItem("ownershipHistory") || "";

      const uploadedDocuments = JSON.parse(
        localStorage.getItem("uploadedDocuments") || "[]",
      );

      const title = agreementForm.property?.flatNumber
        ? `Flat ${agreementForm.property.flatNumber}`
        : "Untitled Agreement";

      await axios.post("http://localhost:5000/api/save-draft", {
        userId: user.uid,
        title,
        agreementForm,
        ownershipHistory,
        finalAgreement: agreement,
        uploadedDocuments,
      });

      alert("Draft Saved Successfully");
    } catch (error) {
      console.log(error);
      alert("Unable to save draft");
    }
  };

  const pageDimensions = {
    A4: { width: "210mm", minHeight: "297mm", printSize: "A4" },
    Legal: { width: "215.9mm", minHeight: "355.6mm", printSize: "legal" },
  };

  const currentLayout = pageDimensions[pageSize];

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("agreementForm") || "{}");

    let rawHistory = localStorage.getItem("ownershipHistory") || "";
    rawHistory = rawHistory.replace(/(?<!^)(\d+\.\s*AND WHEREAS)/g, "\n$1");

    const formattedHistory = rawHistory
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map(
        (line) =>
          `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${line.trim()}</p>`,
      )
      .join("\n");

    const sellerFmt = generatePartyFormats(data.sellers) || {
      fullDetailsBlock: "N/A",
      namesOnlyBlock: "N/A",
      inlineNames: "N/A",
    };
    const purchaserFmt = generatePartyFormats(data.purchasers) || {
      fullDetailsBlock: "N/A",
      namesOnlyBlock: "N/A",
      inlineNames: "N/A",
    };

    // =========================================================================
    // DYNAMIC GRAMMAR VARIABLES
    // =========================================================================

    const isSellerPlural = data.sellers && data.sellers.length > 1;
    const isPurchaserPlural = data.purchasers && data.purchasers.length > 1;

    const sellerTerm = isSellerPlural ? "THE TRANSFERORS" : "THE TRANSFEROR";
    const purchaserTerm = isPurchaserPlural
      ? "THE TRANSFEREES"
      : "THE TRANSFEREE";

    const transferorWord = isSellerPlural ? "Transferors" : "Transferor";
    const transfereeWord = isPurchaserPlural ? "Transferees" : "Transeree";

    // Verbs
    const sellerAgree = isSellerPlural ? "agree" : "agrees";
    const purchaserAgree = isPurchaserPlural ? "agree" : "agrees";
    const sellerHave = isSellerPlural ? "have" : "has";
    const purchaserHave = isPurchaserPlural ? "have" : "has";
    const sellerIs = isSellerPlural ? "are" : "is";
    const purchaserIs = isPurchaserPlural ? "are" : "is";
    const sellerDo = isSellerPlural ? "do" : "does";
    const sellerDeclare = isSellerPlural ? "declare" : "declares";
    const sellerConfirm = isSellerPlural ? "confirm" : "confirms";
    const sellerUndertake = isSellerPlural ? "undertake" : "undertakes";
    const sellerAdmit = isSellerPlural ? "admit" : "admits";
    const sellerAcknowledge = isSellerPlural ? "acknowledge" : "acknowledges";

    // Pronouns & Nouns
    const sellerPronoun = isSellerPlural ? "their" : "his";
    const sellerPronounSubj = isSellerPlural ? "they" : "he";
    const sellerMe = isSellerPlural ? "us" : "me";
    const sellerResignation = isSellerPlural ? "resignations" : "resignation";
    const sellerMember = isSellerPlural ? "members" : "member";

    const purchaserPronoun = isPurchaserPlural ? "their" : "his";
    const purchaserMember = isPurchaserPlural ? "members" : "member";

    // Heirs and assigns
    const sellerHeir = isSellerPlural ? "heirs" : "heir";
    const sellerExecutor = isSellerPlural ? "executors" : "executor";
    const sellerAdministrator = isSellerPlural
      ? "administrators"
      : "administrator";
    const sellerAssign = isSellerPlural ? "assigns" : "assign";

    const purchaserHeir = isPurchaserPlural ? "heirs" : "heir";
    const purchaserExecutor = isPurchaserPlural ? "executors" : "executor";
    const purchaserAdministrator = isPurchaserPlural
      ? "administrators"
      : "administrator";
    const purchaserAssign = isPurchaserPlural ? "assigns" : "assign";

    // --- INHABITANT TEXT LOGIC ---
    const getInhabitantText = (arr) => {
      const count = arr ? arr.length : 0;
      if (count <= 1) return "an adult Indian Inhabitant";
      if (count === 2) return "both adult Indian Inhabitants";
      if (count > 2) return "all adult Indian Inhabitants";
      return "an adult Indian Inhabitant";
    };

    const sellerInhabitants = getInhabitantText(data.sellers);
    const purchaserInhabitants = getInhabitantText(data.purchasers);

    // =========================================================================
    // NEW: INDIAN CURRENCY FORMATTER
    // =========================================================================
    const formatIndianCurrency = (amount) => {
      if (!amount || amount === "_________________")
        return "Rs. _________________/- (Rupees ____________ Only)";

      // Strips out any commas before converting to a number to prevent parsing errors
      const cleanAmount = String(amount).replace(/,/g, "");
      const num = parseInt(cleanAmount, 10);

      if (isNaN(num))
        return "Rs. _________________/- (Rupees ____________ Only)";

      const formatString = new Intl.NumberFormat("en-IN").format(num);

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
            ? (a[Number(nArray[1])] ||
                b[nArray[1][0]] + " " + a[nArray[1][1]]) + "Crore "
            : "";
        str +=
          nArray[2] != 0
            ? (a[Number(nArray[2])] ||
                b[nArray[2][0]] + " " + a[nArray[2][1]]) + "Lakh "
            : "";
        str +=
          nArray[3] != 0
            ? (a[Number(nArray[3])] ||
                b[nArray[3][0]] + " " + a[nArray[3][1]]) + "Thousand "
            : "";
        str +=
          nArray[4] != 0
            ? (a[Number(nArray[4])] ||
                b[nArray[4][0]] + " " + a[nArray[4][1]]) + "Hundred "
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

    // =========================================================================
    // PROPERTY & PAYMENT VARIABLES
    // =========================================================================

    const totalConsiderationNum = parseSafeNumber(
      data.property?.totalConsideration,
    );
    const considerationText = formatIndianCurrency(
      data.property?.totalConsideration,
    );

    const balanceAmount = data.property?.balanceAmount || "_________________";
    const tdsAmount = data.property?.tdsAmount || "0";
    const loanBankName =
      data.property?.loanBankName || "any Bank/Financial Institution";

    const certNo = data.property?.shareCertificateNumber || "_____";
    const certFrom = data.property?.shareDistinctiveNumberFrom || "_____";
    const certTo = data.property?.shareDistinctiveNumberTo || "_____";

    const northBoundary = data.property?.northBy || "_________________";
    const southBoundary = data.property?.southBy || "_________________";
    const eastBoundary = data.property?.eastBy || "_________________";
    const westBoundary = data.property?.westBy || "_________________";

    let paymentSubClauses = "";
    let subChar = 97;

    const payments = data.payments || [];
    payments.forEach((p) => {
      const tokenNum = parseSafeNumber(p.tokenAmount);
      const amountNum = parseSafeNumber(p.amount);

      if (!amountNum && !tokenNum) return;

      if (p.paymentType === "Part Payment") {
        if (tokenNum > 0) {
          paymentSubClauses += `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${String.fromCharCode(subChar)}). The ${transfereeWord} ${purchaserHave} paid to the ${transferorWord} a Token amount of <strong>${formatIndianCurrency(p.tokenAmount)}</strong> via ${p.tokenMode || "Bank Transfer"}, (the receipt and payment whereof the ${transferorWord} doth hereby ${sellerAdmit} & ${sellerAcknowledge}).</p>`;
          subChar++;
        }

        if (amountNum > 0) {
          paymentSubClauses += `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${String.fromCharCode(subChar)}). The ${transfereeWord} ${purchaserHave} already paid to the ${transferorWord}, the sum of <strong>${formatIndianCurrency(p.amount)}</strong> via ${p.mode || "Bank Transfer"} `;
          if (p.date) paymentSubClauses += `on ${p.date} `;
          if (p.bankName) paymentSubClauses += `drawn on ${p.bankName} `;
          if (p.transactionDetails)
            paymentSubClauses += `(Vide Ref/Cheque No: ${p.transactionDetails})`;
          paymentSubClauses += `,being the part payment amount of consideration, towards the sale price of the aforesaid Flat, on or before the execution of these presents, (the receipt and payment whereof the ${transferorWord} doth hereby ${sellerAdmit} & ${sellerAcknowledge}).</p>`;
          subChar++;
        }
      } else {
        if (amountNum > 0) {
          paymentSubClauses += `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${String.fromCharCode(subChar)}). The ${transfereeWord} ${purchaserHave} paid to the ${transferorWord} an amount of <strong>${formatIndianCurrency(p.amount)}</strong> via ${p.mode || "Bank Transfer"} `;
          if (p.date) paymentSubClauses += `on ${p.date} `;
          if (p.bankName) paymentSubClauses += `drawn on ${p.bankName} `;
          if (p.transactionDetails)
            paymentSubClauses += `(Vide Ref/Cheque No: ${p.transactionDetails})`;
          paymentSubClauses += `, (the receipt and payment whereof the ${transferorWord} doth hereby ${sellerAdmit} & ${sellerAcknowledge}).</p>`;
          subChar++;
        }
      }
    });

    paymentSubClauses += `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${String.fromCharCode(subChar)}). The ${transfereeWord} shall pay to the ${transferorWord}, the balance sum of <strong>${formatIndianCurrency(balanceAmount)}</strong> on receipt of Housing Loan amount from ${loanBankName} and/or in any case within _____ days from the date of Registration of Agreement for Sale. (subject to obtaining Transfer/Sale & Mortgage NOC from CIDCO).</p>`;
    subChar++;

    if (totalConsiderationNum > 5000000 && parseSafeNumber(tdsAmount) > 0) {
      paymentSubClauses += `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${String.fromCharCode(subChar)}). The ${transfereeWord} ${purchaserHave} deducted the sum of <strong>${formatIndianCurrency(tdsAmount)}</strong> from the total sale price consideration and will be paid to the Income Tax Department, being the T.D.S. (Tax Deduction at Source) on behalf of the ${transferorWord} of 1% of the Agreement Value, as applicable under the provisions of Section-393(1), of the Income Tax Act, 2025, on or before the date of Registration and a Challan-Cum-Statement shall be furnished to the ${transferorWord} herein.</p>`;
      subChar++;
    }

    paymentSubClauses += `<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">${String.fromCharCode(subChar)}). On receipt of full and final consideration of the sale price, the ${transferorWord} shall hand over all Original Documents in respect of the premises to the ${transfereeWord}.</p>`;

    const finalAgreement = `
<p style="text-align: center; font-weight: bold; font-size: 14pt; text-decoration: underline; margin-bottom: 25px;">AGREEMENT FOR SALE</p>
<p style="text-align: center; font-size: 14pt; line-height: 1.5; margin-bottom: 25px;"><Strong style="font-weight: bold;">THIS AGREEMENT IS  </strong> made and entered into at __________, Navi Mumbai, on ${data.property?.agreementDate || "[DATE]"}</p>
<p style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 25px;">BETWEEN</p>

<p style="text-align: justify; font-size: 14pt; line-height: 1.5; margin-bottom: 25px;">${sellerFmt.fullDetailsBlock}, ${sellerInhabitants}, Residing at ${data.sellerAddress || "[SELLER ADDRESS]"}, hereinafter referred to as <strong>“${sellerTerm}”,</strong> (which expression shall unless it be repugnant to the context or meaning thereof shall mean and include ${sellerPronoun} ${sellerHeir}, ${sellerExecutor}, ${sellerAdministrator} & ${sellerAssign}) of the One Part;</p>

<p style="text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 25px;">AND</p>

<p style="text-align: justify; font-size: 14pt; line-height: 1.5; margin-bottom: 25px;">${purchaserFmt.fullDetailsBlock}, ${purchaserInhabitants}, Residing at ${data.purchaserAddress || "[PURCHASER ADDRESS]"}, hereinafter referred to as <strong>“${purchaserTerm}”</strong> (which expression shall unless it be repugnant to the context or meaning thereof shall mean and include ${purchaserPronoun} ${purchaserHeir}, ${purchaserExecutor}, ${purchaserAdministrator} and ${purchaserAssign}) of the Other Part.</p>

<p style="text-align: left; font-weight: bold; font-size: 14pt; margin-bottom: 15px;">WHEREAS:-</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">1. The City and Industrial Development Corporation of Maharashtra Ltd, a Company incorporated under the Companies Act, 1956 [Act No.1, of 1956] and having its Registered Office at Nirmal Building, 2nd Floor, Nariman Point, Mumbai-21, [hereinafter referred to as the Corporation"] is the New Town Development Authority declared for and designated as a site for the New Towns of Navi Mumbai by the government of Maharashtra in exercise of its powers under Sub-Section (i) and (3-a) of the Maharashtra Regional and Town Planning Act, 1966 [Mah.XXXVII of 1966], [hereinafter referred to as <strong>"the said Act"</strong>].</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">2. The State Government has been acquiring lands pursuant to Section-113-A, of the said Act and vesting such lands in the Corporation for development and disposal;</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">3. The Corporation developed one such piece of land so acquired by the State Government and subsequently vested by the State Government in the Corporation laid down plot for being leased to its intending lessees.</p>

${formattedHistory}

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">15. AND WHEREAS the said premises is in occupation and possession of the ${transferorWord}, subject to the bye-laws rules and regulations of the said Society.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">16. AND WHEREAS the ${transferorWord} ${sellerIs} desirous of transferring the shares of the said Society together with the occupancy and other rights, title and interest and incidental rights, benefits in the said premises in the said Society to the ${transfereeWord}, free from all encumbrances and liabilities, on the basis of ‘AS IS WHERE IS’ alongwith the amounts standing to the credit of the ${transferorWord}, on this day in the books of the said Society towards the deposits, stocks, bonds, sinking fund, dividends and any other amounts to which the ${transferorWord} is legitimately entitled to in ${sellerPronoun} capacity as the ${sellerMember} of the said Society.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">17. AND WHEREAS the ${transfereeWord} ${purchaserIs} desirous and agreeable to purchase the said shares and occupancy and other rights, title, interest and incidental rights and benefits in the said premises in the Society, free from all encumbrances and liabilities, on the basis of ‘AS IS WHERE IS’ along with the amounts standing to the credit of the ${transferorWord} in the said Society, on the terms and conditions agreed between the parties hereto.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">18. AND WHEREAS the transfer of the aforesaid shares together with the occupancy and other rights, title and interest in the said premises are subject to the consent of the said Society as represented by the ${transferorWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 25px;">19. AND WHEREAS the parties hereto are desirous of recording and reducing into writing the terms and conditions of the agreement for transfer of shares together with the rights, title and interest in the said premises in the said Society.</p>

<p style="text-align: left; font-weight: bold; text-decoration: underline; font-size: 14pt; margin-bottom: 15px;">Now This Agreement Witnesseth and It Is Hereby Agreed By and Between the Parties Hereto As Follows:-</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">1.  The ${transferorWord} ${sellerHave} already applied to the Society for transferring the said Flat No. <strong> ${data.property?.flatNumber || ""},</strong> on the  _____Floor, and the said Shares, and other documents, such as; No Objection Certificate in the name of the ${transfereeWord}.  The said Society has also granted No Objection Certificate for transferring the said Flat and the said Share Certificate in the name of the ${transfereeWord}</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">2. The ${transferorWord} ${sellerAgree} to convey and transfer and the ${transfereeWord} ${purchaserAgree} to purchase the aforesaid Flat and five Shares of Rs.50/- each, bearing distinctive numbers from <strong>${certFrom}</strong> to <strong>${certTo}</strong>, under Share Certificate No. <strong>${certNo}</strong>, issued by the said Society in favour of the ${transferorWord} TOGETHER WITH ${sellerPronoun} occupancy and other rights,  title  and  interest  in the said Premises in the said Society and other incidental rights and benefits, free from all encumbrances and liabilities, for a consideration of <strong>${considerationText}</strong> payable by the ${transfereeWord} to the ${transferorWord}</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">3. The ${transfereeWord} shall pay to the ${transferorWord} the said sum of <strong>${considerationText}</strong> in the manner and at the time as hereinafter stated;-</p>

${paymentSubClauses}

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">4. The ${transferorWord} shall hand over vacant and peaceful Possession of the said Flat to the ${transfereeWord}, on receipt of full and final amount of consideration as stated hereinabove.</p>

<p style="text-align: justify; font-weight: bold; text-decoration: underline; line-height: 1.5; margin-bottom: 15px;">5. Upon the receipt of the consideration moneys referred to hereinabove the ${transferorWord}:-</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">a). Shall hand over to the ${transfereeWord} the original Share Certificate No. <strong>${certNo}</strong>, comprising of five shares of Rs. 50/- each bearing distinctive numbers from <strong>${certFrom}</strong> to <strong>${certTo}</strong>.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 25px;">b). Shall hand over to the ${transfereeWord}, the transfer forms duly signed by the ${transferorWord} as regards the transfer of the said five shares of Rs.50/- each, bearing distinctive numbers from <strong>${certFrom}</strong> to <strong>${certTo}</strong>, under Share Certificate No. <strong>${certNo}</strong>, issued by the said Society and all other necessary papers, letters and documents, required for effectively transferring the said five Shares, by the ${transferorWord} to the ${transfereeWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 25px;">c). Shall surrender ${sellerPronoun} occupancy rights, in respect of the said Flat in favour of the ${transfereeWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">d). Shall cause the said Society to allow to occupy the said Flat by the ${transfereeWord} in place and stead of the ${transferorWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">e). Shall tender ${sellerPronoun} ${sellerResignation} as the ${sellerMember} of the said Society.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">f). Shall cause the said Society to enroll the ${transfereeWord} as the ${purchaserMember} of the said Society in place and stead of the ${transferorWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">g). Shall cause the said Society to transfer all the deposits lying with the said Society in the name of the ${transferorWord} to and in favour of the ${transfereeWord} in the records of the said Society. </p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">6. As incidental to the transfer of the said shares, the ${transferorWord} shall also transfer to the ${transfereeWord}, ${sellerPronoun} occupancy rights, in respect of the said Premises & other incidental rights & benefits in respect thereof.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">7. The ${transferorWord} hereby ${sellerAgree} to pay the following dues till the handing over physical possession of the said premises :<br />
i) Pay the NMMC Property Tax till the physical possession is handed over.<br />
ii) Pay the Electricity Bill / maintenance Bill till date.<br />
iii) Society Sale NOC Charges shall be borne and paid by both the parties in equal shares, i.e, 50% each.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">8. It has been agreed that the ${transferorWord} shall comply with all such legal and other formalities including No Objection Certificate from the Society, as may be deemed necessary for effecting the transfer of the aforesaid shares together with the rights, title and interest in the said Premises and also transfer of all the amounts standing to the credit of the ${transferorWord} in the books of the said Society in the name of the ${transfereeWord}</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">9. Upon receipt of full & final amount of consideration moneys as stated hereinabove, the ${transfereeWord} will be entitled to get the electricity bill in respect of the electric meter for supply of electricity to the said premises transferred to the name of the ${transfereeWord} in the records of the MSED Ltd.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">10. The ${transferorWord} ${sellerDeclare} and ${sellerConfirm} that upon payment of consideration money, the ${transfereeWord} and ${purchaserPronoun} ${purchaserHeir}, ${purchaserExecutor}, ${purchaserAdministrator} and ${purchaserAssign} shall and will at all times be entitled to use, occupy, possess the said premises being the Premises, as also the said five shares, issued by the Society without interruption claim or demand of whatsoever nature either from the ${transferorWord} or any other person or persons lawfully or equitably claiming by, from, through, under or in trust for the ${transferorWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">11. The ${transferorWord} ${sellerDeclare} that the said five shares and ${sellerPronoun} occupancy rights in respect of the said Premises are free from all encumbrances, charges, mortgages, litigations and attachments either before or after these presents.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">12. The ${transferorWord} further ${sellerAgree} and ${sellerUndertake} that ${sellerPronounSubj} shall indemnify and keep indemnified the ${transfereeWord} against all claims, including Stamp Duty, Registration Fees, arrears, dues, charges, penalties, suits, legal proceedings or any proceedings before any judicial, quasi-judicial, statutory, municipal, local or other authority in respect of the said Premises brought commenced, filed or instituted by any person whatsoever as relating to the said Premises or the said shares.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">13. The transfer charges, if any, payable to CIDCO for transfer and recording the name of the ${transferorWord} shall be paid and borne by the ${transferorWord}. However, all charges payable to CIDCO for transfer and recording the name of the ${transfereeWord} shall be paid and borne solely by the ${transfereeWord}.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">14. As it is mandatory for disbursement of the loan that all the original documents pertaining to the premises should be handed over to the bank for sanctioning and disbursement of the loan. The ${transferorWord} ${sellerDo} hereby ${sellerAgree} to handover all the original documents pertaining to the flat to the ${transfereeWord} or to the bank so that the loan could be disbursed in time.</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 25px;">15. The ${transfereeWord} ${purchaserAgree} to abide by and observe all the Rules, Regulations and Bye-laws of the said Society.</p>

<p style="text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 15px; text-decoration: underline;">SCHEDULE OF THE LAND</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">ALL THAT PIECE OR PARCEL OF LAND known as Plot No.${data.property?.plotNumber || ""}, in Sector No.${data.property?.sectorNumber || ""}, lying and being at ________, Navi Mumbai, containing by admeasurement _______ Sq. Mtrs., or thereabouts, Taluka & District Thane, Registration District Thane & Registration Sub-District Thane, and bounded as follows that is to say:-</p>

<p style="text-align: left; line-height: 1.5; margin-bottom: 25px;">On Or Towards The North By :  <strong>${northBoundary}</strong><br />
On Or Towards The South By : <strong>${southBoundary}</strong><br />
On Or Towards The East By :  <strong>${eastBoundary}</strong><br />
On Or Towards The West By :  <strong>${westBoundary}</strong></p>

<p style="text-align: justify; font-weight: bold; text-decoration: underline; line-height: 1.5; margin-bottom: 15px;">In Witness Whereof the Parties hereto have Set and Subscribed their Respective Hands and Seals the Day and the Year First Hereinabove Written:</p>

<p style="text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 15px; text-decoration: underline;">SCHEDULE OF PROPERTY</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 25px;">${data.property?.fullAddress || ""} , [hereinafter referred to as <strong>“the said Premises”</strong>), Registration District Thane and Registration Sub-District Vashi/ Koparkhairane</p>

<p style="text-align: left; font-weight: bold; font-size: 14pt; text-decoration: underline; margin-top: 30px; margin-bottom: 40px;">
  In Witness Whereof the Parties hereto have Set and Subscribed their Respective Hands and Seals the Day and the Year First Hereinabove Written:
</p>

<div style="text-align: left; margin-bottom: 60px;">
  <p style="margin: 0; line-height: 1.6;">
    Signed, Sealed and Delivered by the<br/>
    Within named, <strong>"${sellerTerm}"</strong><br/>
    <strong>${sellerFmt.namesOnlyBlock}</strong>
  </p>
  
  <p style="margin-top: 20px; margin-bottom: 15px;">
    in the presence of
  </p>
  
  <p style="margin: 0;">1.</p>
  <br/><br/><br/>
  <p style="margin: 0;">2.</p>
</div>

<div style="text-align: left; margin-bottom: 40px;">
  <p style="margin: 0; line-height: 1.6;">
    Signed, Sealed and Delivered by the<br/>
    Within named, <strong>"${purchaserTerm}"</strong><br/>
    <strong>${purchaserFmt.namesOnlyBlock}</strong>
  </p>
  
  <p style="margin-top: 20px; margin-bottom: 15px;">
    in the presence of
  </p>
  
  <p style="margin: 0;">1.</p>
  <br/><br/><br/>
  <p style="margin: 0;">2.</p>
</div>

<p style="text-align: center; font-weight: bold; font-size: 16pt; letter-spacing: 5px; margin-bottom: 25px; text-decoration: underline;">R E C E I P T</p>

<p style="text-align: justify; line-height: 1.5; margin-bottom: 25px;">RECEIVED of and from the within named ${purchaserTerm}, <strong>${purchaserFmt.namesOnlyBlock}</strong>, the sum of <strong>Rs. [ENTER RECEIPT AMOUNT]/-</strong> paid by [ENTER CHEQUE DETAILS], being the part payment amount of sale price of consideration of the said Flat No. ${data.property?.flatNumber || ""}, in the Society's Building Known as ${data.property?.buildingName || ""}, ${data.property?.fullAddress || ""}, (hereinafter referred to as the said Premises) as within mentioned the day and the year first hereinabove written paid by the ${transfereeWord} to ${sellerMe}.</p>

<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="width: 50%;"></td>
    
    <td style="width: 50%; text-align: center; font-weight: bold; padding-top: 30px;">
      I SAY RECEIVED<br/>
      Rs.1,00,000/-
      
      <br/><br/><br/><br/><br/>
      
      ${sellerFmt.namesOnlyBlock}<br/>
      (${sellerTerm})
    </td>
  </tr>
</table>

<div style="margin-top: 50px;">
  <p style="text-align: left; font-weight: bold; text-decoration: underline; margin-bottom: 20px;">
    WITNESSES:
  </p>
  <p style="text-align: left; margin: 0;">
    1.
  </p>
  
  <br/><br/><br/>
  
  <p style="text-align: left; margin: 0;">
    2.
  </p>
</div>
`;

    setAgreement(finalAgreement);
  }, []);

  return (
    <div
      className="min-h-screen p-4 sm:p-8 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="backdrop-blur-sm border-b border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 bg-white/70">
          {/* LOGO AND HEADING */}
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="Company Logo"
              className="h-17 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center w-full md:w-auto">
            {/* Document Size */}
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
              <label className="text-sm font-semibold text-slate-700">
                Size:
              </label>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="Legal">Legal (8.5 x 14 in)</option>
              </select>
            </div>

            {/* DOWNLOAD AS WORD */}
            <button
              onClick={exportToWord}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm rounded"
            >
              DOCX
            </button>

            {/* DOWNLOAD AS PDF */}
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-white text-red-500 text-sm font-medium hover:bg-red-500 hover:text-white transition shadow-sm border border-red-500 rounded"
            >
              PDF
            </button>

            {/* Save Draft Button */}
            <button
              onClick={saveDraft}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition shadow-sm rounded"
            >
              Save Draft
            </button>
          </div>
        </div>

        {/* EDITOR CANVAS - REMOVED w-full and overflow-x-auto to let CSS max-width scale it naturally */}
        <div className="shadow-2xl pb-4">
          <Editor
            key={pageSize}
            onInit={(evt, editor) => (editorRef.current = editor)}
            value={agreement}
            onEditorChange={(newContent) => setAgreement(newContent)}
            init={{
              height: 850,
              menubar: true,
              license_key: "gpl",
              skin: false,
              content_css: false,
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
                "wordcount",
                "pagebreak",
              ],
              toolbar:
                "fontfamily fontsize | undo redo | " +
                "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                "bullist numlist | pagebreak | print",
              font_family_formats:
                "Cambria=cambria,georgia,serif; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Times margin=times new roman,times,serif; Roboto=roboto,sans-serif;",
              font_size_formats: "8pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt",
              content_style: `
                @media print {
                  @page {
                    size: ${currentLayout.printSize};
                    margin: 25.4mm;
                  }
                  body {
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    width: 100% !important;
                  }
                }
                html {
                  background-color: transparent; 
                  padding: 1rem 0;
                }
                body { 
                  width: 100%; 
                  max-width: ${currentLayout.width}; 
                  min-height: ${currentLayout.minHeight}; 
                  box-sizing: border-box;
                  margin: 0 auto !important; 
                  padding: 15mm; 
                  background-color: #ffffff;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                  font-family: Cambria, Georgia, serif; 
                  font-size: 14pt; 
                  line-height: 1.5;
                }
                @media screen and (max-width: 600px) {
                  body {
                    padding: 8mm; /* Slightly smaller padding on mobile to save space */
                  }
                }
                .mce-pagebreak {
                  border: 1px dashed #ccc;
                  margin: 15px 0;
                  display: block;
                  width: 100%;
                  page-break-before: always;
                }
                p {
                  margin: 0 0 15px 0;
                }
              `,
            }}
          />
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50 flex items-center justify-center"
        title="Open Clause Assistant"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chatbot Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[75vh] sm:max-h-128 h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Clause Assistant
            </h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

          {/* Quick Actions */}
          <div className="bg-gray-50 p-2 border-b border-gray-200 flex gap-2 overflow-x-auto text-xs whitespace-nowrap">
            <button
              onClick={() => handleQuickAction("rephrase")}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-medium transition"
            >
              Rephrase Selected
            </button>
            <button
              onClick={() => handleQuickAction("grammar")}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 font-medium transition"
            >
              Check Grammar
            </button>
            <button
              onClick={() => setChatInput("Draft a new clause for: ")}
              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 font-medium transition"
            >
              New Clause
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white self-end rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me to draft or modify..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendMessage()}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateAgreement;
