export const declarationTemplate = (data) => {
  // 1. Dynamic Grammar Logic
  const isSellerPlural = data.sellers && data.sellers.length > 1;

  // I vs We, my vs our, etc.
  const s_PronounSubj = isSellerPlural ? "We" : "I";
  const s_PronounSubjLower = isSellerPlural ? "we" : "i";
  const s_PronounPoss = isSellerPlural ? "our" : "my";
  const s_PronounObj = isSellerPlural ? "us" : "me";
  const s_Deponent = isSellerPlural ? "Deponents" : "Deponent";

  // 2. Helper Function for Detailed Seller Formatting (Numbered)
  const formatDeclarationSellers = (sellers, address) => {
    if (!sellers || sellers.length === 0) return "";

    // Step A: Format Name, Age, and PAN with numbering
    const details = sellers.map((s, index) => {
      const prefix = sellers.length > 1 ? `${index + 1}) ` : "";
      return `${prefix}<strong>${s.title} ${s.name}</strong>, aged ${s.age || "___"} years, having (PAN NO. <strong>${s.pan || "__________"}</strong>)`;
    });

    // Step B: Join the sellers properly with "AND"
    let formattedSellers = "";
    if (details.length === 1) {
      formattedSellers = details[0];
    } else if (details.length === 2) {
      formattedSellers = details.join(", AND ");
    } else {
      formattedSellers =
        details.slice(0, -1).join(", ") +
        ", AND " +
        details[details.length - 1];
    }

    // Step C: Apply specific Inhabitant Grammar
    let inhabitantGrammar = "";
    if (sellers.length === 1) {
      inhabitantGrammar = "an adult, Indian inhabitant";
    } else if (sellers.length === 2) {
      inhabitantGrammar = "both adults, Indian inhabitants";
    } else {
      inhabitantGrammar = "all adults, Indian inhabitants";
    }

    // Step D: Apply the common seller address
    const finalAddress = address
      ? `residing address ${address}`
      : "residing address ________________________";

    // Combine it all starting with "I" or "We"
    return `${s_PronounSubj} ${formattedSellers}, ${inhabitantGrammar}, ${finalAddress}`;
  };

  // 3. Helper Function for Numbered Signature Block
  const formatSignatureNames = (sellers) => {
    if (!sellers || sellers.length === 0) return "___________________________";
    if (sellers.length === 1)
      return `<strong>${sellers[0].title} ${sellers[0].name}</strong>`;

    // Create stacked numbered signatures for multiple sellers
    return sellers
      .map(
        (s, i) =>
          `<div style="margin-bottom: 5px;">${i + 1}) <strong>${s.title} ${s.name}</strong></div>`,
      )
      .join("");
  };

  // 4. Extract pre-formatted names
  const purchaserNames = data.purchaserNames || "______________________";

  // 5. Fallback for Property Address
  const fullPropertyAddress =
    data.propertyAddress ||
    `Flat No. ${data.flatNo || "____"}, ${data.buildingAddress || "____"}, ${data.societyName || "____"}`;

  // 6. The Template Literal (Exact Formatting & Alignment)
  return `
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.8; max-width: 850px; margin: 0 auto; text-align: justify; color: #000; padding: 40px;">
        
        <h2 style="text-align: center; text-decoration: underline; font-weight: bold; font-size: 14pt; margin-bottom: 30px;">
            AFFIDAVIT CUM DECLARATION
        </h2>

        <p style="margin-bottom: 20px;">
            ${formatDeclarationSellers(data.sellers, data.sellerAddress)}, do hereby as follows:
        </p>

        <p style="margin-bottom: 20px;">
            ${s_PronounSubj} have sale the in <strong>${fullPropertyAddress}</strong> (hereinafter called the "said Flat"), to <strong>${purchaserNames}</strong>, vide an agreement for sale dated _____ day of _______________, 20___.
        </p>

        <p style="margin-bottom: 20px;">
            ${s_PronounSubj} have applied before the office of <strong>CIDCO Ltd.</strong>, for transfer the said Flat in ${s_PronounPoss} name in respect of the said Flat.
        </p>

        <p style="margin-bottom: 20px;">
            ${s_PronounSubj} say that ${s_PronounSubjLower} have not done any kind of illegal/addition construction in the said premises. also ${s_PronounSubjLower} have not violated the condition regarding change of use. ${s_PronounSubjLower} will be responsible for any future legal action.
        </p>

        <p style="margin-bottom: 20px;">
            ${s_PronounSubj} say that, if there is any dispute or problem about the said premises now or in future, ${s_PronounSubjLower} will be responsible for it, CIDCO will not be responsible for it.
        </p>

        <p style="margin-bottom: 40px;">
            That Whatever stated above is true and correct to the best of ${s_PronounPoss} knowledge and information and nothing in concealed here in.
        </p>

        <div style="margin-bottom: 60px;">
            <p style="margin: 0;">Solemnly affirmed at <strong>${data.placeOfExecution || "Navi Mumbai"}</strong></p>
            <p style="margin: 0;">On this _____ day of _______________, 20___.</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="width: 45%;">
                <p><strong>Identified by ${s_PronounObj}</strong></p>
                <br><br>
                <p>___________________________</p>
            </div>
            <div style="text-align: left; min-width: 250px;">
                ${formatSignatureNames(data.sellers)}
                <p style="margin-top: 15px; font-weight: bold;">${s_Deponent}</p>
            </div>
        </div>

    </div>
  `;
};
