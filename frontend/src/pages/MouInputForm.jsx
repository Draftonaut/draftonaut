import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logoblue.png";
import bgImage from "../assets/formbg.webp";

// =========================================================================
// DATE FORMATTER ENGINES (Used for generating the final document)
// =========================================================================

// Execution Date format (e.g. 20th day of July 2026)
const formatLegalDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  const dateObj = new Date(year, parseInt(month) - 1, day);
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleString("en-US", { month: "long" });
  const yearNum = dateObj.getFullYear();
  const getOrdinalSuffix = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${dayNum}${getOrdinalSuffix(dayNum)} day of ${monthName} ${yearNum}`;
};

// Payment Date format (e.g. 29.03.2026)
const formatPaymentDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  return `${day}.${month}.${year}`;
};

// =========================================================================
// INDIAN NUMBER-TO-WORDS CONVERTER (Auto-Spelling)
// =========================================================================
const convertNumberToWords = (amount) => {
  if (!amount) return "";
  let num = parseInt(amount.toString().replace(/,/g, ""), 10);
  if (isNaN(num)) return "";
  if (num === 0) return "Zero Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
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

  const numToWords = (n) => {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
  };

  let word = "";
  if (Math.floor(num / 10000000) > 0) {
    word += numToWords(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (Math.floor(num / 100000) > 0) {
    word += numToWords(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (Math.floor(num / 1000) > 0) {
    word += numToWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (Math.floor(num / 100) > 0) {
    word += numToWords(Math.floor(num / 100)) + " Hundred ";
    num %= 100;
  }
  if (num > 0) {
    word += numToWords(num);
  }
  return word.trim() + " Only";
};

// =========================================================================
// 1. REUSABLE PREMIUM INPUT COMPONENTS
// =========================================================================
const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className = "",
  readOnly = false,
  isLegalDate = false,
  isPaymentDate = false,
}) => {
  return (
    <div className={className}>
      <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full h-11 px-4 text-sm border text-slate-800 outline-none rounded-none transition-all duration-200 ${readOnly ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed font-semibold" : "bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0269ff] focus:ring-4 focus:ring-[#0269ff]/10 hover:border-slate-300"} ${type === "date" ? "cursor-pointer" : ""}`}
      />
      {/* Tiny helper to show exactly what will print on the final document without blocking the scroller */}
      {type === "date" && value && isLegalDate && (
        <p className="mt-1.5 text-[10px] font-bold text-[#0269ff] tracking-wide">
          Document Output: {formatLegalDate(value)}
        </p>
      )}
      {type === "date" && value && isPaymentDate && (
        <p className="mt-1.5 text-[10px] font-bold text-[#0269ff] tracking-wide">
          Document Output: {formatPaymentDate(value)}
        </p>
      )}
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
}) => (
  <div className={className}>
    <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-11 px-4 text-sm border border-slate-200 bg-slate-50 text-slate-800 outline-none rounded-none transition-all duration-200 focus:bg-white focus:border-[#0269ff] focus:ring-4 focus:ring-[#0269ff]/10 hover:border-slate-300 cursor-pointer appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
        backgroundSize: "1.2em 1.2em",
        paddingRight: "2.5rem",
      }}
    >
      <option value="" disabled>
        Select {label}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// =========================================================================
// 2. MAIN MOU COMPONENT
// =========================================================================
function MouInputForm() {
  const navigate = useNavigate();

  // 1. Execution
  const [execution, setExecution] = useState({ place: "", date: "" });

  // 2. Sellers
  const [sellers, setSellers] = useState([
    { title: "", fullName: "", age: "", panCard: "" },
  ]);
  const [sellerAddress, setSellerAddress] = useState("");

  // 3. Purchasers
  const [purchasers, setPurchasers] = useState([
    { title: "", fullName: "", age: "", panCard: "" },
  ]);
  const [purchaserAddress, setPurchaserAddress] = useState("");

  // 4. Property
  const [property, setProperty] = useState({
    flatNo: "",
    societyName: "",
    fullAddress: "",
  });

  // 5. Financials (Single Inputs)
  const [financials, setFinancials] = useState({
    totalConsideration: "",
    totalConsiderationWords: "",
    regConsideration: "",
    regConsiderationWords: "",
    // Token
    tokenAmount: "",
    tokenAmountWords: "",
    tokenMode: "Cheque",
    chequeNo: "",
    chequeDate: "",
    bankName: "",
    // Full & Final Payment
    fullFinalAmount: "",
    fullFinalAmountWords: "",
    fullFinalMode: "Cheque",
    fullFinalRefNo: "",
    fullFinalBank: "",
    fullFinalDate: "",
    fullFinalTiming: "After Execution",
    // Loan & TDS
    loanBalanceAmount: "",
    loanBalanceAmountWords: "",
    loanTimeframeDays: "",
    tdsAmount: "",
    tdsAmountWords: "",
  });

  // 5.1 Dynamic Arrays for Part & Cash Payments
  const [partPayments, setPartPayments] = useState([]);
  const [cashPayments, setCashPayments] = useState([]);

  // UI Toggles for Add Buttons
  const [showToken, setShowToken] = useState(false);
  const [showFullFinal, setShowFullFinal] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [showBrokerage, setShowBrokerage] = useState(false);

  // 6. Mortgage
  const [mortgage, setMortgage] = useState({
    isMortgaged: false,
    bankName: "",
    loanAcc: "",
    outstandingAmount: "",
    outstandingWords: "",
  });

  // 7. Brokerage
  const [brokerage, setBrokerage] = useState({
    completionDeadline: "",
    sellerBrokerName: "",
    sellerBrokerPercent: "",
    purchaserBrokerName: "",
    purchaserBrokerPercent: "",
  });

  // --- Automatic Calculations & Logic ---
  const regConsiderationNum = Number(financials.regConsideration) || 0;
  const showTDS = regConsiderationNum >= 5000000;

  // Dropdown Options arrays
  const loanBankOptions = [
    "HDFC Bank",
    "ICICI Bank",
    "State Bank of India",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Bank of Baroda",
    "Punjab National Bank",
    "Canara Bank",
    "Union Bank of India",
    "IDBI Bank",
  ];
  const paymentModeOptions = ["Cheque", "RTGS", "NEFT", "UPI", "Cash"];
  const timingOptions = ["Before Execution", "After Execution"];

  // --- Handlers ---
  const handleObjectChange = (e, state, setState) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, e, state, setState) => {
    const updatedArray = state.map((item, i) => {
      if (i === index) return { ...item, [e.target.name]: e.target.value };
      return item;
    });
    setState(updatedArray);
  };

  const addField = (state, setState, defaultObject) =>
    setState([...state, defaultObject]);
  const removeField = (index, state, setState) =>
    setState(state.filter((_, i) => i !== index));

  const handleFinancialsChange = (e) => {
    const { name, value } = e.target;
    let updatedFinancials = { ...financials, [name]: value };

    const numericFields = [
      "totalConsideration",
      "regConsideration",
      "tokenAmount",
      "fullFinalAmount",
      "loanBalanceAmount",
      "tdsAmount",
    ];

    // Amount in Words conversion
    if (numericFields.includes(name)) {
      updatedFinancials[`${name}Words`] = convertNumberToWords(value);
    }

    // TDS Calculation
    if (name === "regConsideration") {
      const tempReg = Number(value);
      if (tempReg >= 5000000) {
        const calcTds = (tempReg * 0.01).toFixed(0);
        updatedFinancials.tdsAmount = calcTds;
        updatedFinancials.tdsAmountWords = convertNumberToWords(calcTds);
      } else {
        updatedFinancials.tdsAmount = "";
        updatedFinancials.tdsAmountWords = "";
      }
    }
    setFinancials(updatedFinancials);
  };

  // Dynamic Handlers for Part Payments & Cash Payments (Includes Timing & Words)
  const addPartPayment = () =>
    setPartPayments([
      ...partPayments,
      {
        amount: "",
        amountWords: "",
        mode: "Cheque",
        refNo: "",
        bank: "",
        date: "",
        timing: "Before Execution",
      },
    ]);
  const removePartPayment = (index) =>
    setPartPayments(partPayments.filter((_, i) => i !== index));
  const handlePartPaymentChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...partPayments];
    updated[index][name] = value;
    if (name === "amount") {
      updated[index].amountWords = convertNumberToWords(value);
    }
    setPartPayments(updated);
  };

  const addCashPayment = () =>
    setCashPayments([
      ...cashPayments,
      { amount: "", amountWords: "", date: "", timing: "Before Execution" },
    ]);
  const removeCashPayment = (index) =>
    setCashPayments(cashPayments.filter((_, i) => i !== index));
  const handleCashPaymentChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...cashPayments];
    updated[index][name] = value;
    if (name === "amount") {
      updated[index].amountWords = convertNumberToWords(value);
    }
    setCashPayments(updated);
  };

  const handleMortgageChange = (e) => {
    const { name, value } = e.target;
    const updatedMortgage = { ...mortgage, [name]: value };
    if (name === "outstandingAmount") {
      updatedMortgage.outstandingWords = convertNumberToWords(value);
    }
    setMortgage(updatedMortgage);
  };

  const handleContinue = () => {
    const sellerTitle =
      sellers.length === 1 ? "TRANSFEROR/SELLER" : "TRANSFERORS/SELLERS";
    const purchaserTitle =
      purchasers.length === 1
        ? "TRANSFEREE/PURCHASER"
        : "TRANSFEREES/PURCHASERS";
    const sellerInhabitantText =
      sellers.length === 1
        ? "an adult, Indian inhabitant"
        : "adults, Indian inhabitants";
    const purchaserInhabitantText =
      purchasers.length === 1
        ? "an adult, Indian inhabitant"
        : "adults, Indian inhabitants";

    const formattedPartPayments = partPayments.map((p) => ({
      ...p,
      formattedDate: formatPaymentDate(p.date),
    }));
    const formattedCashPayments = cashPayments.map((c) => ({
      ...c,
      formattedDate: formatPaymentDate(c.date),
    }));

    const finalData = {
      execution: {
        place: execution.place,
        date: formatLegalDate(execution.date),
      },
      sellers,
      sellerAddress,
      purchasers,
      purchaserAddress,
      property: {
        ...property,
        totalConsideration: financials.totalConsideration,
      },
      financials: {
        ...financials,
        formattedChequeDate: formatPaymentDate(financials.chequeDate),
        formattedFullFinalDate: formatPaymentDate(financials.fullFinalDate),
      },
      partPayments: formattedPartPayments,
      cashPayments: formattedCashPayments,
      mortgage,
      brokerage: {
        ...brokerage,
        showBrokerage,
        formattedDeadline: formatPaymentDate(brokerage.completionDeadline),
      },
      grammar: {
        sellerTitle,
        purchaserTitle,
        sellerInhabitantText,
        purchaserInhabitantText,
        sellerPronounTheir: sellers.length === 1 ? "his/her" : "their",
        sellerPronounThey: sellers.length === 1 ? "he/she" : "they",
        purchaserPronounTheir: purchasers.length === 1 ? "his/her" : "their",
        purchaserPronounThey: purchasers.length === 1 ? "he/she" : "they",
      },
    };

    localStorage.setItem("generatedMouData", JSON.stringify(finalData));
    localStorage.setItem("currentPreviewDoc", "MOU");
    navigate("/mou-preview");
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat relative overflow-hidden bg-slate-50 lg:bg-transparent"
      style={{
        backgroundImage: `url(${bgImage})`,
        fontFamily: "Futura PT, Futura, sans-serif",
      }}
    >
      <div className="hidden lg:block absolute top-6 left-12 z-20">
        <img
          src={logo}
          alt="LegalTech"
          className="h-15 drop-shadow-md cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center justify-center border-b border-slate-200 shadow-sm">
        <img
          src={logo}
          alt="LegalTech"
          className="h-14 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="absolute top-16 lg:top-0 right-0 w-full lg:w-1/2 h-[calc(100%-4rem)] lg:h-full flex flex-col bg-white lg:bg-white/95 lg:backdrop-blur-md lg:border-l border-white/40 z-10 lg:shadow-[-20px_0_40px_rgba(0,0,0,0.1)]">
        <div className="flex-1 overflow-y-auto p-5 md:p-10 lg:p-12 custom-scrollbar space-y-10 pb-20">
          <div className="border-b border-slate-200 pb-6 text-center lg:text-left pt-2 lg:pt-0">
            <div className="inline-flex items-center justify-center px-3 py-1 mb-4 bg-blue-50 border border-blue-100 text-[#0269ff] text-[10px] font-bold uppercase tracking-widest rounded-none">
              AI Powered MOU
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Generate New MOU
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Fill in the details below to draft your Memorandum of
              Understanding.
            </p>
          </div>

          {/* ================= SECTION 1: EXECUTION ================= */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  1
                </span>
                Execution Details
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5 p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-none">
              <InputField
                label="Execution Place"
                name="place"
                value={execution.place}
                onChange={(e) => handleObjectChange(e, execution, setExecution)}
                placeholder="e.g., Koparkhairane"
              />
              <InputField
                label="Execution Date"
                type="date"
                name="date"
                value={execution.date}
                onChange={(e) => handleObjectChange(e, execution, setExecution)}
                isLegalDate={true}
              />
            </div>
          </section>

          {/* ================= SECTION 2: SELLERS ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  2
                </span>
                Transferor(s) / Seller(s)
              </h2>
            </div>
            <div className="p-4 md:p-5 mb-5 bg-slate-50 border border-slate-200 rounded-none">
              <InputField
                label="Common Address for All Sellers"
                name="sellerAddress"
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="Enter the shared residential address here..."
              />
            </div>
            <div className="space-y-4">
              {sellers.map((seller, index) => (
                <div
                  key={`seller-${index}`}
                  className="relative p-5 md:p-6 bg-white border border-slate-200 shadow-sm transition hover:border-blue-200 rounded-none"
                >
                  {sellers.length > 1 && (
                    <button
                      onClick={() => removeField(index, sellers, setSellers)}
                      className="absolute top-4 right-4 text-[10px] bg-red-50 text-red-600 px-2 py-1 hover:bg-red-100 font-bold uppercase tracking-wider transition rounded-none"
                    >
                      Remove
                    </button>
                  )}
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Seller #{index + 1}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div className="flex gap-3">
                      <SelectField
                        label="Title"
                        name="title"
                        value={seller.title}
                        onChange={(e) =>
                          handleArrayChange(index, e, sellers, setSellers)
                        }
                        options={["Shri", "Smt.", "Mr.", "Mrs.", "Ms."]}
                        className="w-[35%]"
                      />
                      <InputField
                        label="Full Legal Name"
                        name="fullName"
                        value={seller.fullName}
                        onChange={(e) =>
                          handleArrayChange(index, e, sellers, setSellers)
                        }
                        placeholder="e.g. John Doe"
                        className="w-[65%]"
                      />
                    </div>
                    <div className="flex gap-3">
                      <InputField
                        label="Age"
                        name="age"
                        type="number"
                        value={seller.age}
                        onChange={(e) =>
                          handleArrayChange(index, e, sellers, setSellers)
                        }
                        placeholder="Years"
                        className="w-[35%]"
                      />
                      <InputField
                        label="PAN Card No."
                        name="panCard"
                        value={seller.panCard}
                        onChange={(e) =>
                          handleArrayChange(index, e, sellers, setSellers)
                        }
                        placeholder="ABCDE1234F"
                        className="w-[65%] uppercase"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                addField(sellers, setSellers, {
                  title: "",
                  fullName: "",
                  age: "",
                  panCard: "",
                })
              }
              className="mt-4 px-4 py-2 text-[#0269ff] bg-blue-50 hover:bg-blue-100 text-xs font-bold uppercase tracking-wide transition flex items-center gap-2 rounded-none"
            >
              + Add Another Seller
            </button>
          </section>

          {/* ================= SECTION 3: PURCHASERS ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  3
                </span>
                Transferee(s) / Purchaser(s)
              </h2>
            </div>
            <div className="p-4 md:p-5 mb-5 bg-slate-50 border border-slate-200 rounded-none">
              <InputField
                label="Common Address for All Purchasers"
                name="purchaserAddress"
                value={purchaserAddress}
                onChange={(e) => setPurchaserAddress(e.target.value)}
                placeholder="Enter the shared residential address here..."
              />
            </div>
            <div className="space-y-4">
              {purchasers.map((purchaser, index) => (
                <div
                  key={`purchaser-${index}`}
                  className="relative p-5 md:p-6 bg-white border border-slate-200 shadow-sm transition hover:border-blue-200 rounded-none"
                >
                  {purchasers.length > 1 && (
                    <button
                      onClick={() =>
                        removeField(index, purchasers, setPurchasers)
                      }
                      className="absolute top-4 right-4 text-[10px] bg-red-50 text-red-600 px-2 py-1 hover:bg-red-100 font-bold uppercase tracking-wider transition rounded-none"
                    >
                      Remove
                    </button>
                  )}
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Purchaser #{index + 1}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div className="flex gap-3">
                      <SelectField
                        label="Title"
                        name="title"
                        value={purchaser.title}
                        onChange={(e) =>
                          handleArrayChange(index, e, purchasers, setPurchasers)
                        }
                        options={["Shri", "Smt.", "Mr.", "Mrs.", "Ms."]}
                        className="w-[35%]"
                      />
                      <InputField
                        label="Full Legal Name"
                        name="fullName"
                        value={purchaser.fullName}
                        onChange={(e) =>
                          handleArrayChange(index, e, purchasers, setPurchasers)
                        }
                        placeholder="e.g. Jane Doe"
                        className="w-[65%]"
                      />
                    </div>
                    <div className="flex gap-3">
                      <InputField
                        label="Age"
                        name="age"
                        type="number"
                        value={purchaser.age}
                        onChange={(e) =>
                          handleArrayChange(index, e, purchasers, setPurchasers)
                        }
                        placeholder="Years"
                        className="w-[35%]"
                      />
                      <InputField
                        label="PAN Card No."
                        name="panCard"
                        value={purchaser.panCard}
                        onChange={(e) =>
                          handleArrayChange(index, e, purchasers, setPurchasers)
                        }
                        placeholder="ABCDE1234F"
                        className="w-[65%] uppercase"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                addField(purchasers, setPurchasers, {
                  title: "",
                  fullName: "",
                  age: "",
                  panCard: "",
                })
              }
              className="mt-4 px-4 py-2 text-[#0269ff] bg-blue-50 hover:bg-blue-100 text-xs font-bold uppercase tracking-wide transition flex items-center gap-2 rounded-none"
            >
              + Add Another Purchaser
            </button>
          </section>

          {/* ================= SECTION 4: PROPERTY DETAILS ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  4
                </span>
                Property Details
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5 p-5 md:p-6 bg-white border border-slate-200 shadow-sm mb-6 rounded-none">
              <InputField
                label="Flat/Unit Number"
                name="flatNo"
                value={property.flatNo}
                onChange={(e) => handleObjectChange(e, property, setProperty)}
                placeholder="e.g. A-101"
              />
              <InputField
                label="Society / Building Name"
                name="societyName"
                value={property.societyName}
                onChange={(e) => handleObjectChange(e, property, setProperty)}
                placeholder="e.g. Sunshine Apartments"
              />
              <InputField
                label="Full Property Address"
                name="fullAddress"
                value={property.fullAddress}
                onChange={(e) => handleObjectChange(e, property, setProperty)}
                placeholder="Detailed address of the property..."
                className="md:col-span-2"
              />
            </div>
          </section>

          {/* ================= SECTION 5: FINANCIAL OVERVIEW ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  5
                </span>
                Financial Overview
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-none">
                <InputField
                  label="Total Consideration Amount (Rs.)"
                  name="totalConsideration"
                  type="number"
                  value={financials.totalConsideration}
                  onChange={handleFinancialsChange}
                  placeholder="e.g. 14200000"
                />
                <InputField
                  label="Total Consideration (In Words)"
                  name="totalConsiderationWords"
                  value={financials.totalConsiderationWords}
                  onChange={handleFinancialsChange}
                  placeholder="Auto-generates spelling..."
                  className="bg-white"
                  readOnly
                />
                <InputField
                  label="Agreement Value (Rs.)"
                  name="regConsideration"
                  type="number"
                  value={financials.regConsideration}
                  onChange={handleFinancialsChange}
                  placeholder="e.g. 11500000"
                />
                <InputField
                  label="Agreement Value (In Words)"
                  name="regConsiderationWords"
                  value={financials.regConsiderationWords}
                  onChange={handleFinancialsChange}
                  placeholder="Auto-generates spelling..."
                  className="bg-white"
                  readOnly
                />
              </div>

              {showTDS && (
                <div className="p-4 bg-amber-50 border border-amber-200 shadow-sm rounded-none animate-fade-in grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                      Auto-Calculated TDS (1% of Agreement Value)
                    </h3>
                  </div>
                  <InputField
                    label="TDS Amount (1%)"
                    name="tdsAmount"
                    value={financials.tdsAmount}
                    onChange={handleFinancialsChange}
                    readOnly
                  />
                  <InputField
                    label="TDS Words"
                    name="tdsAmountWords"
                    value={financials.tdsAmountWords}
                    onChange={handleFinancialsChange}
                    readOnly
                    className="bg-white"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Add Payment Tranches
                </p>
                <div className="flex flex-wrap gap-2">
                  {!showToken && (
                    <button
                      type="button"
                      onClick={() => setShowToken(true)}
                      className="px-3 py-1.5 bg-white border border-[#0269ff] text-[#0269ff] text-[10px] font-bold uppercase rounded-none hover:bg-blue-50 transition"
                    >
                      + Token
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addPartPayment}
                    className="px-3 py-1.5 bg-white border border-[#0269ff] text-[#0269ff] text-[10px] font-bold uppercase rounded-none hover:bg-blue-50 transition"
                  >
                    + Part Payment
                  </button>
                  {!showFullFinal && (
                    <button
                      type="button"
                      onClick={() => setShowFullFinal(true)}
                      className="px-3 py-1.5 bg-white border border-[#0269ff] text-[#0269ff] text-[10px] font-bold uppercase rounded-none hover:bg-blue-50 transition"
                    >
                      + Full & Final Payment
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addCashPayment}
                    className="px-3 py-1.5 bg-white border border-[#0269ff] text-[#0269ff] text-[10px] font-bold uppercase rounded-none hover:bg-blue-50 transition"
                  >
                    + Cash Payment
                  </button>
                  {!showLoan && (
                    <button
                      type="button"
                      onClick={() => setShowLoan(true)}
                      className="px-3 py-1.5 bg-white border border-[#0269ff] text-[#0269ff] text-[10px] font-bold uppercase rounded-none hover:bg-blue-50 transition"
                    >
                      + Home Loan
                    </button>
                  )}
                </div>
              </div>

              {/* 1. TOKEN */}
              {showToken && (
                <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-none relative animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setShowToken(false);
                      setFinancials((prev) => ({
                        ...prev,
                        tokenAmount: "",
                        tokenAmountWords: "",
                        tokenMode: "",
                        chequeNo: "",
                        chequeDate: "",
                        bankName: "",
                      }));
                    }}
                    className="absolute -top-2.5 right-2 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 border border-red-100 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Token Amount (Before Execution)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Amount (Rs.)"
                      name="tokenAmount"
                      type="number"
                      value={financials.tokenAmount}
                      onChange={handleFinancialsChange}
                      placeholder="e.g. 200000"
                    />
                    <InputField
                      label="Amount (Words)"
                      name="tokenAmountWords"
                      value={financials.tokenAmountWords}
                      onChange={handleFinancialsChange}
                      className="bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <SelectField
                      label="Payment Mode"
                      name="tokenMode"
                      value={financials.tokenMode}
                      onChange={handleFinancialsChange}
                      options={paymentModeOptions}
                    />
                    <InputField
                      label="Date"
                      type="date"
                      name="chequeDate"
                      value={financials.chequeDate}
                      onChange={handleFinancialsChange}
                      isPaymentDate={true}
                    />
                    <InputField
                      label="Ref / Cheque No."
                      name="chequeNo"
                      value={financials.chequeNo}
                      onChange={handleFinancialsChange}
                      placeholder="013385"
                    />
                    <InputField
                      label="Bank Name"
                      name="bankName"
                      value={financials.bankName}
                      onChange={handleFinancialsChange}
                      placeholder="IDBI Bank"
                    />
                  </div>
                </div>
              )}

              {/* 2. PART PAYMENTS */}
              {partPayments.length > 0 && (
                <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-none animate-fade-in">
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Part Payment(s)
                  </h3>
                  {partPayments.map((payment, index) => (
                    <div
                      key={index}
                      className="relative bg-slate-50 p-4 border border-slate-200 mb-4"
                    >
                      <button
                        type="button"
                        onClick={() => removePartPayment(index)}
                        className="absolute -top-2.5 right-2 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 border border-red-100 hover:bg-red-100 transition"
                      >
                        Remove
                      </button>

                      <div className="mb-4">
                        <SelectField
                          label="Payment Timing"
                          name="timing"
                          value={payment.timing}
                          onChange={(e) => handlePartPaymentChange(index, e)}
                          options={timingOptions}
                          className="w-full md:w-1/2"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <InputField
                          label="Amount (Rs.)"
                          name="amount"
                          type="number"
                          value={payment.amount}
                          onChange={(e) => handlePartPaymentChange(index, e)}
                        />
                        <InputField
                          label="Amount in Words"
                          name="amountWords"
                          value={payment.amountWords}
                          readOnly
                          className="bg-white"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                        <SelectField
                          label="Payment Mode"
                          name="mode"
                          value={payment.mode}
                          onChange={(e) => handlePartPaymentChange(index, e)}
                          options={paymentModeOptions}
                        />
                        <InputField
                          label="Date"
                          name="date"
                          type="date"
                          value={payment.date}
                          onChange={(e) => handlePartPaymentChange(index, e)}
                          isPaymentDate={true}
                        />
                        <InputField
                          label="Ref / Cheque No."
                          name="refNo"
                          value={payment.refNo}
                          onChange={(e) => handlePartPaymentChange(index, e)}
                        />
                        <InputField
                          label="Bank Name"
                          name="bank"
                          value={payment.bank}
                          onChange={(e) => handlePartPaymentChange(index, e)}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPartPayment}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-none hover:bg-blue-100 transition"
                  >
                    + Add Another Part Payment
                  </button>
                </div>
              )}

              {/* 3. FULL & FINAL */}
              {showFullFinal && (
                <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-none relative animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullFinal(false);
                      setFinancials((prev) => ({
                        ...prev,
                        fullFinalAmount: "",
                        fullFinalAmountWords: "",
                        fullFinalMode: "Cheque",
                        fullFinalRefNo: "",
                        fullFinalBank: "",
                        fullFinalDate: "",
                        fullFinalTiming: "After Execution",
                      }));
                    }}
                    className="absolute -top-2.5 right-2 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 border border-red-100 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Full & Final Payment
                  </h3>

                  <div className="mb-4">
                    <SelectField
                      label="Payment Timing"
                      name="fullFinalTiming"
                      value={financials.fullFinalTiming}
                      onChange={handleFinancialsChange}
                      options={timingOptions}
                      className="w-full md:w-1/2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <InputField
                      label="Amount (Rs.)"
                      name="fullFinalAmount"
                      type="number"
                      value={financials.fullFinalAmount}
                      onChange={handleFinancialsChange}
                      placeholder="5385000"
                    />
                    <InputField
                      label="Amount in Words"
                      name="fullFinalAmountWords"
                      value={financials.fullFinalAmountWords}
                      onChange={handleFinancialsChange}
                      readOnly
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <SelectField
                      label="Payment Mode"
                      name="fullFinalMode"
                      value={financials.fullFinalMode}
                      onChange={handleFinancialsChange}
                      options={paymentModeOptions}
                    />
                    <InputField
                      label="Date"
                      type="date"
                      name="fullFinalDate"
                      value={financials.fullFinalDate}
                      onChange={handleFinancialsChange}
                      isPaymentDate={true}
                    />
                    <InputField
                      label="Ref / Cheque No."
                      name="fullFinalRefNo"
                      value={financials.fullFinalRefNo}
                      onChange={handleFinancialsChange}
                    />
                    <InputField
                      label="Bank Name"
                      name="fullFinalBank"
                      value={financials.fullFinalBank}
                      onChange={handleFinancialsChange}
                    />
                  </div>
                </div>
              )}

              {/* 4. CASH PAYMENTS */}
              {cashPayments.length > 0 && (
                <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-none animate-fade-in">
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Cash Payment Schedule
                  </h3>
                  {cashPayments.map((payment, index) => (
                    <div
                      key={index}
                      className="relative bg-slate-50 p-4 border border-slate-200 mb-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => removeCashPayment(index)}
                        className="absolute -top-2.5 right-2 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 border border-red-100 hover:bg-red-100 transition"
                      >
                        Remove
                      </button>

                      <SelectField
                        label="Payment Timing"
                        name="timing"
                        value={payment.timing}
                        onChange={(e) => handleCashPaymentChange(index, e)}
                        options={timingOptions}
                      />
                      <InputField
                        label="Amount (Rs.)"
                        name="amount"
                        type="number"
                        value={payment.amount}
                        onChange={(e) => handleCashPaymentChange(index, e)}
                      />
                      <InputField
                        label="Amount in Words"
                        name="amountWords"
                        value={payment.amountWords}
                        readOnly
                        className="bg-white"
                      />
                      <InputField
                        label="Payment Date"
                        name="date"
                        type="date"
                        value={payment.date}
                        onChange={(e) => handleCashPaymentChange(index, e)}
                        isPaymentDate={true}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCashPayment}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-none hover:bg-blue-100 transition"
                  >
                    + Add Another Cash Payment
                  </button>
                </div>
              )}

              {/* 5. LOAN */}
              {showLoan && (
                <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-none relative animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoan(false);
                      setFinancials((prev) => ({
                        ...prev,
                        loanBalanceAmount: "",
                        loanBalanceAmountWords: "",
                        loanTimeframeDays: "",
                      }));
                    }}
                    className="absolute -top-2.5 right-2 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 border border-red-100 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                  <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                    Home Loan Portion
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <InputField
                      label="Loan Amount (Rs.)"
                      name="loanBalanceAmount"
                      type="number"
                      value={financials.loanBalanceAmount}
                      onChange={handleFinancialsChange}
                      placeholder="4000000"
                    />
                    <InputField
                      label="Loan Amount in Words"
                      name="loanBalanceAmountWords"
                      value={financials.loanBalanceAmountWords}
                      onChange={handleFinancialsChange}
                      readOnly
                      className="bg-slate-50"
                    />
                    <InputField
                      label="Timeframe (Days)"
                      name="loanTimeframeDays"
                      value={financials.loanTimeframeDays}
                      onChange={handleFinancialsChange}
                      placeholder="60"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ================= SECTION 6: MORTGAGE DETAILS ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  6
                </span>
                Mortgage Status
              </h2>
            </div>
            <div className="p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-none mb-6">
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    checked={mortgage.isMortgaged === true}
                    onChange={() =>
                      setMortgage({ ...mortgage, isMortgaged: true })
                    }
                    className="w-4 h-4 accent-[#0269ff] cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 font-semibold group-hover:text-[#0269ff] transition-colors">
                    Property is Mortgaged
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    checked={mortgage.isMortgaged === false}
                    onChange={() =>
                      setMortgage({
                        ...mortgage,
                        isMortgaged: false,
                        bankName: "",
                        loanAcc: "",
                        outstandingAmount: "",
                        outstandingWords: "",
                      })
                    }
                    className="w-4 h-4 accent-[#0269ff] cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 font-semibold group-hover:text-[#0269ff] transition-colors">
                    Not Mortgaged
                  </span>
                </label>
              </div>
              {mortgage.isMortgaged && (
                <div className="grid md:grid-cols-2 gap-4 md:gap-5 bg-white p-4 border border-slate-200 animate-fade-in">
                  <SelectField
                    label="Bank Name"
                    name="bankName"
                    value={mortgage.bankName}
                    onChange={handleMortgageChange}
                    options={loanBankOptions}
                  />
                  <InputField
                    label="Loan Account No."
                    name="loanAcc"
                    value={mortgage.loanAcc}
                    onChange={handleMortgageChange}
                  />
                  <InputField
                    label="Outstanding Amount"
                    type="number"
                    name="outstandingAmount"
                    value={mortgage.outstandingAmount}
                    onChange={handleMortgageChange}
                    placeholder="9100000"
                  />
                  <InputField
                    label="Amount in Words"
                    name="outstandingWords"
                    value={mortgage.outstandingWords}
                    onChange={handleMortgageChange}
                    placeholder="Auto-generates spelling..."
                    className="bg-slate-50"
                    readOnly
                  />
                </div>
              )}
            </div>
          </section>

          {/* ================= SECTION 7: BROKERAGE & DEADLINE ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  7
                </span>
                Completion Deadline & Brokerage
              </h2>
              {!showBrokerage && (
                <button
                  type="button"
                  onClick={() => setShowBrokerage(true)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-none hover:bg-blue-200 transition"
                >
                  + Add Broker
                </button>
              )}
            </div>
            <div className="p-5 md:p-6 bg-white border border-slate-200 shadow-sm rounded-none">
              <InputField
                label="Completion Deadline Date"
                type="date"
                name="completionDeadline"
                value={brokerage.completionDeadline}
                onChange={(e) => handleObjectChange(e, brokerage, setBrokerage)}
                isPaymentDate={true}
              />
              {showBrokerage && (
                <div className="mt-6 pt-6 border-t border-slate-200 relative grid md:grid-cols-2 gap-4 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBrokerage(false);
                      setBrokerage({
                        ...brokerage,
                        sellerBrokerName: "",
                        purchaserBrokerName: "",
                        sellerBrokerPercent: "",
                        purchaserBrokerPercent: "",
                      });
                    }}
                    className="absolute -top-3 right-0 text-red-500 text-[10px] font-bold uppercase bg-red-50 border border-red-100 px-2 py-1 hover:bg-red-100 transition"
                  >
                    Remove Brokers
                  </button>
                  <div className="border border-slate-200 p-4">
                    <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                      Seller Broker
                    </h3>
                    <InputField
                      label="Name(s)"
                      name="sellerBrokerName"
                      value={brokerage.sellerBrokerName}
                      onChange={(e) =>
                        handleObjectChange(e, brokerage, setBrokerage)
                      }
                      className="mb-3"
                    />
                    <InputField
                      label="Brokerage %"
                      name="sellerBrokerPercent"
                      value={brokerage.sellerBrokerPercent}
                      onChange={(e) =>
                        handleObjectChange(e, brokerage, setBrokerage)
                      }
                      placeholder="e.g. 2%"
                    />
                  </div>
                  <div className="border border-slate-200 p-4">
                    <h3 className="text-xs font-bold text-[#0269ff] mb-4 uppercase tracking-wider">
                      Purchaser Broker
                    </h3>
                    <InputField
                      label="Name(s)"
                      name="purchaserBrokerName"
                      value={brokerage.purchaserBrokerName}
                      onChange={(e) =>
                        handleObjectChange(e, brokerage, setBrokerage)
                      }
                      className="mb-3"
                    />
                    <InputField
                      label="Brokerage %"
                      name="purchaserBrokerPercent"
                      value={brokerage.purchaserBrokerPercent}
                      onChange={(e) =>
                        handleObjectChange(e, brokerage, setBrokerage)
                      }
                      placeholder="e.g. 2%"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ================= FOOTER ================= */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-10 pt-6 border-t border-slate-200 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Step 1 of 2
              </span>
              <span className="text-sm font-semibold text-slate-800">
                Review & Continue
              </span>
            </div>
            <button
              onClick={handleContinue}
              className="w-full sm:w-auto h-12 px-8 bg-[#0269ff] text-white text-sm font-bold tracking-widest uppercase hover:bg-[#0256d6] shadow-lg shadow-[#0269ff]/30 hover:shadow-[#0269ff]/50 transition-all duration-200 flex justify-center items-center gap-2 rounded-none"
            >
              Generate MOU Document
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default MouInputForm;
