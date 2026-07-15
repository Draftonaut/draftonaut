import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logoblue.png";
import bgImage from "../assets/formbg.webp";

// =========================================================================
// DATE FORMATTER ENGINE
// =========================================================================
const formatLegalDate = (dateString) => {
  if (!dateString) return "";

  // Split manually to avoid timezone shift issues
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

  return `${dayNum}${getOrdinalSuffix(dayNum)} day of ${monthName}, ${yearNum}`;
};

// =========================================================================
// 1. REUSABLE PREMIUM INPUT COMPONENTS (SHARP CORNERS)
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
}) => {
  if (type === "date" && isLegalDate) {
    return (
      <div className={className}>
        <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
        <div className="relative">
          <input
            type="text"
            value={formatLegalDate(value) || ""}
            readOnly
            placeholder="Select a date..."
            className="w-full h-11 px-4 text-sm border border-slate-200 bg-slate-50 text-slate-800 outline-none rounded-none cursor-pointer focus:bg-white focus:border-[#0269ff] transition-all duration-200"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0269ff] pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <input
            type="date"
            name={name}
            value={value}
            onChange={onChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  }

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
        className={`w-full h-11 px-4 text-sm border text-slate-800 outline-none rounded-none transition-all duration-200 ${
          readOnly
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed font-semibold"
            : "bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0269ff] focus:ring-4 focus:ring-[#0269ff]/10 hover:border-slate-300"
        }`}
      />
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
        Select {label.replace(" Mode", "").replace(" Type", "")}
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
// 2. MAIN AGREEMENT COMPONENT
// =========================================================================
function NewAgreement() {
  const navigate = useNavigate();

  // Dynamic States for Sellers and Purchasers
  const [sellers, setSellers] = useState([
    { title: "", fullName: "", age: "", panCard: "" },
  ]);
  const [purchasers, setPurchasers] = useState([
    { title: "", fullName: "", age: "", panCard: "" },
  ]);

  // States for Common Addresses
  const [sellerAddress, setSellerAddress] = useState("");
  const [purchaserAddress, setPurchaserAddress] = useState("");

  // Payments Array State
  const [payments, setPayments] = useState([
    {
      paymentType: "",
      tokenAmount: "",
      tokenMode: "",
      amount: "",
      mode: "",
      date: "",
      bankName: "",
      transactionDetails: "",
    },
  ]);

  // Property details - Added isShareCertificateIssued
  const [property, setProperty] = useState({
    flatNumber: "",
    buildingName: "",
    fullAddress: "",
    agreementDate: "",
    isShareCertificateIssued: true, // NEW LOGIC STATE
    shareCertificateNumber: "",
    shareDistinctiveNumberFrom: "",
    shareDistinctiveNumberTo: "",
    northBy: "",
    southBy: "",
    eastBy: "",
    westBy: "",
    totalConsideration: "",
    tdsAmount: "",
    loanAmount: "",
    loanBankName: "",
  });

  // --- Automatic Calculations & Logic ---
  const totalConsiderationNum = Number(property.totalConsideration) || 0;
  const loanAmountNum = Number(property.loanAmount) || 0;

  const totalPaymentsPaid = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0) + (Number(p.tokenAmount) || 0),
    0,
  );

  const balanceAmount =
    totalConsiderationNum - totalPaymentsPaid - loanAmountNum;
  const showTDS = totalConsiderationNum > 5000000;

  // --- Dropdown Options arrays ---
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
  const paymentModeOptions = ["Cash", "UPI", "RTGS", "NEFT", "Cheque"];

  // --- Handlers ---
  const handlePropertyChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, e, state, setState) => {
    const updatedArray = state.map((item, i) => {
      if (i === index) {
        if (
          e.target.name === "paymentType" &&
          e.target.value === "Full Payment"
        ) {
          return {
            ...item,
            [e.target.name]: e.target.value,
            tokenAmount: "",
            tokenMode: "",
          };
        }
        return { ...item, [e.target.name]: e.target.value };
      }
      return item;
    });
    setState(updatedArray);
  };

  const addField = (state, setState, defaultObject) => {
    setState([...state, defaultObject]);
  };

  const removeField = (index, state, setState) => {
    const updatedArray = state.filter((_, i) => i !== index);
    setState(updatedArray);
  };

  const generatePartyFormats = (parties, commonAddress) => {
    const validParties = parties.filter((p) => p.fullName.trim() !== "");
    if (validParties.length === 0) return null;

    const total = validParties.length;
    let memberStrings = [];
    let addressStr = commonAddress ? commonAddress : "[Address]";

    validParties.forEach((p, i) => {
      let title = p.title || "";
      let name = p.fullName || "";
      let age = p.age || "[Age]";
      let pan = p.panCard || "[PAN]";
      let prefix = title ? `${title} ` : "";

      if (total === 1) {
        memberStrings.push(
          `${prefix}${name}, aged ${age} years, having PAN card ${pan}`,
        );
      } else {
        if (i === 0) {
          memberStrings.push(
            `(1) ${prefix}${name}, aged ${age} years, having PAN card ${pan}`,
          );
        } else {
          memberStrings.push(
            `(${i + 1}) ${prefix}${name}, aged ${age} years, (${pan})`,
          );
        }
      }
    });

    if (total > 1) {
      return memberStrings.join(", ") + ` both/all residing at ${addressStr}.`;
    } else {
      return memberStrings[0] + ` residing at ${addressStr}.`;
    }
  };

  const handleContinue = () => {
    const formattedPayments = payments.map((p) => ({
      ...p,
      formattedDate: formatLegalDate(p.date),
    }));

    const finalData = {
      sellers,
      sellerAddress,
      purchasers,
      purchaserAddress,
      property: {
        ...property,
        balanceAmount,
        agreementDate: formatLegalDate(property.agreementDate),
        rawAgreementDate: property.agreementDate,
      },
      payments: formattedPayments,
      generatedClauses: {
        sellersFormatted: generatePartyFormats(sellers, sellerAddress),
        purchasersFormatted: generatePartyFormats(purchasers, purchaserAddress),
      },
    };
    localStorage.setItem("agreementForm", JSON.stringify(finalData));
    navigate("/upload-document");
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat relative overflow-hidden bg-slate-50 lg:bg-transparent"
      style={{
        backgroundImage: `url(${bgImage})`,
        fontFamily: "Futura PT, Futura, sans-serif",
      }}
    >
      {/* 1. DESKTOP LOGO: Hidden on mobile */}
      <div className="hidden lg:block absolute top-6 left-12 z-20">
        <img
          src={logo}
          alt="LegalTech"
          className="h-15 drop-shadow-md cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 2. MOBILE HEADER: Fixed top, white bg, perfectly centered */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center justify-center border-b border-slate-200 shadow-sm">
        <img
          src={logo}
          alt="LegalTech"
          className="h-14 sobject-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 3. RIGHT SIDE: Form Container */}
      <div className="absolute top-16 lg:top-0 right-0 w-full lg:w-1/2 h-[calc(100%-4rem)] lg:h-full flex flex-col bg-white lg:bg-white/95 lg:backdrop-blur-md lg:border-l border-white/40 z-10 lg:shadow-[-20px_0_40px_rgba(0,0,0,0.1)]">
        {/* Scrollable Form Area with Custom Scroller */}
        <div className="flex-1 overflow-y-auto p-5 md:p-10 lg:p-12 custom-scrollbar space-y-10 pb-20">
          {/* Header Title */}
          <div className="border-b border-slate-200 pb-6 text-center lg:text-left pt-2 lg:pt-0">
            <div className="inline-flex items-center justify-center px-3 py-1 mb-4 bg-blue-50 border border-blue-100 text-[#0269ff] text-[10px] font-bold uppercase tracking-widest rounded-none">
              AI Powered Agreement
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Generate New Agreement
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Fill in the details below to draft your legal document instantly.
            </p>
          </div>

          {/* ================= SELLERS SECTION ================= */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  1
                </span>
                Seller Details
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another Seller
            </button>
          </section>

          {/* ================= PURCHASERS SECTION ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  2
                </span>
                Purchaser Details
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another Purchaser
            </button>
          </section>

          {/* ================= PROPERTY SECTION ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  3
                </span>
                Property & Consideration
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-5 p-5 md:p-6 bg-white border border-slate-200 shadow-sm mb-6 rounded-none">
              <InputField
                label="Date of Agreement"
                type="date"
                name="agreementDate"
                value={property.agreementDate}
                onChange={handlePropertyChange}
                isLegalDate={true}
              />

              <InputField
                label="Flat/Unit Number"
                name="flatNumber"
                value={property.flatNumber}
                onChange={handlePropertyChange}
                placeholder="e.g. A-101"
              />
              <InputField
                label="Building Name"
                name="buildingName"
                value={property.buildingName}
                onChange={handlePropertyChange}
                placeholder="e.g. Sunshine Apartments"
                className="md:col-span-2"
              />
              <InputField
                label="Full Property Address"
                name="fullAddress"
                value={property.fullAddress}
                onChange={handlePropertyChange}
                placeholder="Detailed address of the property..."
                className="md:col-span-2"
              />

              {/* ================= SHARE CERTIFICATE LOGIC HERE ================= */}
              <div className="md:col-span-2 mt-4 md:mt-6 border-b border-slate-200 pb-4 mb-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Share Certificate Details
                </h3>

                {/* NEW RADIO BUTTON TOGGLE */}
                <div className="flex gap-6 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="shareCertStatus"
                      checked={property.isShareCertificateIssued === true}
                      onChange={() =>
                        setProperty({
                          ...property,
                          isShareCertificateIssued: true,
                        })
                      }
                      className="w-4 h-4 accent-[#0269ff] cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 font-semibold group-hover:text-[#0269ff] transition-colors">
                      Issued
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="shareCertStatus"
                      checked={property.isShareCertificateIssued === false}
                      onChange={() =>
                        setProperty({
                          ...property,
                          isShareCertificateIssued: false,
                          shareCertificateNumber: "",
                          shareDistinctiveNumberFrom: "",
                          shareDistinctiveNumberTo: "",
                        })
                      }
                      className="w-4 h-4 accent-[#0269ff] cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 font-semibold group-hover:text-[#0269ff] transition-colors">
                      Not Issued
                    </span>
                  </label>
                </div>
              </div>

              {/* DYNAMIC READ-ONLY INPUTS based on the toggle */}
              <InputField
                label="Share Certificate Number"
                name="shareCertificateNumber"
                value={property.shareCertificateNumber}
                onChange={handlePropertyChange}
                readOnly={!property.isShareCertificateIssued}
                placeholder={
                  !property.isShareCertificateIssued ? "N/A (Not Issued)" : ""
                }
              />

              <InputField
                label="Share Distinctive Number From"
                name="shareDistinctiveNumberFrom"
                value={property.shareDistinctiveNumberFrom}
                onChange={handlePropertyChange}
                readOnly={!property.isShareCertificateIssued}
                placeholder={
                  !property.isShareCertificateIssued ? "N/A (Not Issued)" : ""
                }
              />

              <InputField
                label="Share Distinctive Number To"
                name="shareDistinctiveNumberTo"
                value={property.shareDistinctiveNumberTo}
                onChange={handlePropertyChange}
                readOnly={!property.isShareCertificateIssued}
                placeholder={
                  !property.isShareCertificateIssued ? "N/A (Not Issued)" : ""
                }
              />

              <div className="md:col-span-2 mt-4 md:mt-6">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                  Property Boundaries
                </h3>
              </div>

              <InputField
                label="North By"
                name="northBy"
                value={property.northBy}
                onChange={handlePropertyChange}
              />

              <InputField
                label="South By"
                name="southBy"
                value={property.southBy}
                onChange={handlePropertyChange}
              />

              <InputField
                label="East By"
                name="eastBy"
                value={property.eastBy}
                onChange={handlePropertyChange}
              />

              <InputField
                label="West By"
                name="westBy"
                value={property.westBy}
                onChange={handlePropertyChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-5 p-5 md:p-6 bg-slate-50 border border-slate-200 shadow-sm rounded-none">
              <div className="md:col-span-2 mb-1">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
                  Financial Overview
                </h3>
              </div>
              <InputField
                label="Total Consideration Amount"
                type="number"
                name="totalConsideration"
                value={property.totalConsideration}
                onChange={handlePropertyChange}
                placeholder="₹ 0.00"
              />

              {showTDS && (
                <div className="animate-fade-in">
                  <InputField
                    label="TDS Amount (1%)"
                    type="number"
                    name="tdsAmount"
                    value={property.tdsAmount}
                    onChange={handlePropertyChange}
                    placeholder="₹ 0.00"
                  />
                </div>
              )}

              <InputField
                label="Loan Amount"
                type="number"
                name="loanAmount"
                value={property.loanAmount}
                onChange={handlePropertyChange}
                placeholder="₹ 0.00"
              />

              <SelectField
                label="Loan Bank Name"
                name="loanBankName"
                value={property.loanBankName}
                onChange={handlePropertyChange}
                options={loanBankOptions}
              />

              <div className="md:col-span-2 mt-2 p-4 bg-[#0269ff]/5 border border-[#0269ff]/20 rounded-none">
                <InputField
                  label="Balance Amount To Be Paid (Auto-Calculated)"
                  type="number"
                  name="balanceAmount"
                  value={balanceAmount}
                  readOnly={true}
                  placeholder="₹ 0.00"
                />
              </div>
            </div>
          </section>

          {/* ================= PAYMENTS SECTION ================= */}
          <section>
            <div className="flex items-center justify-between mb-5 pt-6 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#0269ff] text-white flex items-center justify-center text-xs rounded-none">
                  4
                </span>
                Payment History
              </h2>
            </div>

            <div className="space-y-5">
              {payments.map((payment, index) => (
                <div
                  key={`payment-${index}`}
                  className="relative p-5 md:p-6 bg-white border border-slate-200 shadow-sm transition hover:border-blue-200 rounded-none"
                >
                  {payments.length > 1 && (
                    <button
                      onClick={() => removeField(index, payments, setPayments)}
                      className="absolute top-4 right-4 text-[10px] bg-red-50 text-red-600 px-2 py-1 hover:bg-red-100 font-bold uppercase tracking-wider transition rounded-none"
                    >
                      Remove
                    </button>
                  )}
                  <h3 className="text-xs font-bold text-[#0269ff] mb-5 uppercase tracking-wider">
                    Transaction #{index + 1}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                    <div className="md:col-span-2">
                      <SelectField
                        label="Payment Type"
                        name="paymentType"
                        value={payment.paymentType}
                        onChange={(e) =>
                          handleArrayChange(index, e, payments, setPayments)
                        }
                        options={["Full Payment", "Part Payment"]}
                      />
                    </div>

                    {payment.paymentType === "Part Payment" && (
                      <div className="md:col-span-2 grid md:grid-cols-2 gap-4 md:gap-5 p-4 md:p-5 bg-[#0269ff]/5 border border-[#0269ff]/30 relative overflow-hidden animate-fade-in rounded-none">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0269ff]"></div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold text-[#0269ff] uppercase flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Token Payment Details
                          </p>
                        </div>
                        <InputField
                          label="Token Amount"
                          type="number"
                          name="tokenAmount"
                          value={payment.tokenAmount}
                          onChange={(e) =>
                            handleArrayChange(index, e, payments, setPayments)
                          }
                          placeholder="₹ 0.00"
                        />
                        <SelectField
                          label="Token Payment Mode"
                          name="tokenMode"
                          value={payment.tokenMode}
                          onChange={(e) =>
                            handleArrayChange(index, e, payments, setPayments)
                          }
                          options={paymentModeOptions}
                        />
                      </div>
                    )}

                    <InputField
                      label={
                        payment.paymentType === "Part Payment"
                          ? "Remaining / Main Amount Paid"
                          : "Total Amount Paid"
                      }
                      type="number"
                      name="amount"
                      value={payment.amount}
                      onChange={(e) =>
                        handleArrayChange(index, e, payments, setPayments)
                      }
                      placeholder="₹ 0.00"
                    />
                    <SelectField
                      label="Payment Mode"
                      name="mode"
                      value={payment.mode}
                      onChange={(e) =>
                        handleArrayChange(index, e, payments, setPayments)
                      }
                      options={paymentModeOptions}
                    />

                    <InputField
                      label="Date of Payment"
                      type="date"
                      name="date"
                      value={payment.date}
                      onChange={(e) =>
                        handleArrayChange(index, e, payments, setPayments)
                      }
                      isLegalDate={true}
                    />

                    <InputField
                      label="Bank Name"
                      name="bankName"
                      value={payment.bankName}
                      onChange={(e) =>
                        handleArrayChange(index, e, payments, setPayments)
                      }
                      placeholder="e.g. HDFC Bank"
                    />
                    <InputField
                      label="Transaction / Cheque Details"
                      name="transactionDetails"
                      value={payment.transactionDetails}
                      onChange={(e) =>
                        handleArrayChange(index, e, payments, setPayments)
                      }
                      placeholder="Ref No. / Cheque No."
                      className="md:col-span-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                addField(payments, setPayments, {
                  paymentType: "",
                  tokenAmount: "",
                  tokenMode: "",
                  amount: "",
                  date: "",
                  mode: "",
                  bankName: "",
                  transactionDetails: "",
                })
              }
              className="mt-5 px-4 py-2 text-[#0269ff] bg-blue-50 hover:bg-blue-100 text-xs font-bold uppercase tracking-wide transition flex items-center gap-2 rounded-none"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another Transaction
            </button>
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
              Upload Documents
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
        /* CUSTOM UI SCROLLER */
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

export default NewAgreement;
