import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import bgImage from "../assets/formbg.webp";
import logo from "../assets/logoblue.png";

import { declarationTemplate } from "../templates/DeclarationTemplate";
import { indemnityBondTemplate } from "../templates/IndemnityBondTemplate";
import { commonFormTemplate } from "../templates/CommonFormTemplate";
import { affidavitTemplate } from "../templates/Affidavittemplate";

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center mt-8 mb-4">
    <div className="w-7 h-7 bg-[#0055ff] text-white flex items-center justify-center font-bold rounded-sm mr-3 text-base">
      {number}
    </div>
    <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
  </div>
);

const Label = ({ children }) => (
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full bg-white border border-slate-200 p-2.5 outline-none focus:border-[#0055ff] transition-colors text-slate-700 rounded-sm text-sm placeholder:text-slate-400 ${className}`}
    {...props}
  />
);

function DocumentGenerator() {
  const navigate = useNavigate();

  const selectedDocs = useMemo(() => {
    return JSON.parse(localStorage.getItem("selectedDocuments") || "[]");
  }, []);

  const [isExtracting, setIsExtracting] = useState(false);

  const [formData, setFormData] = useState({
    placeOfExecution: "",
    societyName: "",
    flatNo: "",
    buildingAddress: "",
    propertyAddress: "",
    shareCertificateNumber: "",
    shareDistinctiveFrom: "",
    shareDistinctiveTo: "",
    totalConsideration: "",
    bankName: "",
    sellerAddress: "",
    purchaserAddress: "",
  });

  const [sellers, setSellers] = useState([
    { title: "Mr.", name: "", age: "", pan: "" },
  ]);

  const [purchasers, setPurchasers] = useState([
    { title: "Mr.", name: "", age: "", pan: "" },
  ]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    const data = new FormData();
    data.append("document", file);

    try {
      // Ensure this URL matches your backend endpoint
      const response = await fetch("https://draftonaut.onrender.com", {
        method: "POST",
        body: data,
      });

      if (!response.ok) throw new Error("Extraction failed");

      const extracted = await response.json();

      setFormData((prev) => ({
        ...prev,
        placeOfExecution: extracted.placeOfExecution || prev.placeOfExecution,
        societyName: extracted.societyName || prev.societyName,
        flatNo: extracted.flatNo || prev.flatNo,
        buildingAddress: extracted.buildingAddress || prev.buildingAddress,
        propertyAddress: extracted.propertyAddress || prev.propertyAddress,
        shareCertificateNumber:
          extracted.shareCertificateNumber || prev.shareCertificateNumber,
        shareDistinctiveFrom:
          extracted.shareDistinctiveFrom || prev.shareDistinctiveFrom,
        shareDistinctiveTo:
          extracted.shareDistinctiveTo || prev.shareDistinctiveTo,
        totalConsideration:
          extracted.totalConsideration || prev.totalConsideration,
        bankName: extracted.bankName || prev.bankName,
        sellerAddress: extracted.sellerAddress || prev.sellerAddress,
        purchaserAddress: extracted.purchaserAddress || prev.purchaserAddress,
      }));

      // Update sellers and purchasers arrays if data is found
      if (extracted.sellers && extracted.sellers.length > 0) {
        setSellers(extracted.sellers);
      }

      if (extracted.purchasers && extracted.purchasers.length > 0) {
        setPurchasers(extracted.purchasers);
      }
    } catch (error) {
      console.error("Error auto-filling document:", error);
      alert("Failed to auto-fill document. Please fill manually.");
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateSeller = (index, field, value) => {
    const updated = [...sellers];
    updated[index][field] = value;
    setSellers(updated);
  };

  const updatePurchaser = (index, field, value) => {
    const updated = [...purchasers];
    updated[index][field] = value;
    setPurchasers(updated);
  };

  const addSeller = () =>
    setSellers([...sellers, { title: "Mr.", name: "", age: "", pan: "" }]);
  const removeSeller = (index) =>
    sellers.length > 1 && setSellers(sellers.filter((_, i) => i !== index));

  const addPurchaser = () =>
    setPurchasers([
      ...purchasers,
      { title: "Mr.", name: "", age: "", pan: "" },
    ]);
  const removePurchaser = (index) =>
    purchasers.length > 1 &&
    setPurchasers(purchasers.filter((_, i) => i !== index));

  const formatNamesAdvanced = (
    people,
    includePan = false,
    useInlineAnd = false,
  ) => {
    const validPeople = people.filter((p) => p.name.trim());
    if (validPeople.length === 0) return "";

    const mappedNames = validPeople.map((p) => {
      let text = `${p.title} ${p.name.trim()}`.trim();
      if (includePan && p.pan.trim()) {
        text += ` (PAN: ${p.pan.trim()})`;
      }
      return text;
    });

    const separator = useInlineAnd ? " and " : " & ";
    if (mappedNames.length === 1) return mappedNames[0];
    if (mappedNames.length === 2)
      return `${mappedNames[0]}${separator}${mappedNames[1]}`;
    return (
      mappedNames.slice(0, -1).join(", ") +
      separator +
      mappedNames[mappedNames.length - 1]
    );
  };

  const handleGenerate = () => {
    if (selectedDocs.length === 0) {
      alert("No document selected.");
      navigate("/all-documents");
      return;
    }

    const finalData = {
      ...formData,
      sellers,
      purchasers,
      sellerNames: formatNamesAdvanced(sellers, false, false),
      purchaserNames: formatNamesAdvanced(purchasers, false, false),
      sellerNamesNumbered: formatNamesAdvanced(sellers, false, false),
      purchaserNamesNumbered: formatNamesAdvanced(purchasers, false, false),
      sellerNamesInline: formatNamesAdvanced(sellers, false, true),
      purchaserNamesInline: formatNamesAdvanced(purchasers, false, true),
      sellerNamesWithPan: formatNamesAdvanced(sellers, true, false),
      purchaserNamesWithPan: formatNamesAdvanced(purchasers, true, false),
      sellerNamesInlineWithPan: formatNamesAdvanced(sellers, true, true),
      purchaserNamesInlineWithPan: formatNamesAdvanced(purchasers, true, true),
    };

    const documents = [];

    if (selectedDocs.includes("Declaration"))
      documents.push({
        title: "Declaration",
        html: declarationTemplate(finalData),
      });
    if (selectedDocs.includes("Indemnity Bond"))
      documents.push({
        title: "Indemnity Bond",
        html: indemnityBondTemplate(finalData),
      });
    if (selectedDocs.includes("Common Form"))
      documents.push({
        title: "Common Form",
        html: commonFormTemplate(finalData),
      });
    if (selectedDocs.includes("Affidavit"))
      documents.push({
        title: "Affidavit",
        html: affidavitTemplate(finalData),
      });

    localStorage.setItem("generatedDocuments", JSON.stringify(documents));
    localStorage.setItem("documentForm", JSON.stringify(finalData));
    navigate("/document-preview");
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-slate-50">
      <div
        className="fixed inset-0 hidden lg:block"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <img
        src={logo}
        alt="Logo"
        className="fixed top-6 left-12 h-15 object-contain z-50 hidden lg:block"
      />

      <div className="absolute right-0 top-0 h-screen w-full lg:w-[55%] xl:w-[50%] flex flex-col items-center justify-start bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] overflow-y-auto">
        {isExtracting && (
          <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-[#0055ff] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#0055ff] font-bold tracking-wide">
              Extracting Data...
            </p>
          </div>
        )}

        <div className="w-full max-w-3xl p-6 lg:p-10">
          <div className="w-full flex justify-center lg:hidden mb-8">
            <img
              src={logo}
              alt="Logo"
              className="h-12 md:h-16 object-contain"
            />
          </div>

          <div className="mb-6">
            <div className="inline-block bg-[#f0f5ff] text-[#0055ff] font-bold text-[10px] px-2.5 py-1 mb-3 rounded-sm tracking-widest uppercase border border-[#d6e4ff]">
              AI Powered Agreement
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Generate New Agreement
            </h1>
            <p className="text-slate-500 text-sm">
              Fill in the details below to draft your legal document instantly.
            </p>
          </div>

          <hr className="border-slate-100 mb-6" />

          <div className="mb-6">
            <input
              type="file"
              // ADDED .doc and .docx below
              accept=".pdf, .png, .jpg, .jpeg, .doc, .docx"
              onChange={handleFileUpload}
              className="hidden"
              id="ai-autofill-upload"
            />
            <label
              htmlFor="ai-autofill-upload"
              className="flex items-center justify-center w-full py-4 bg-[#f8fafc] border border-slate-300 hover:border-[#0055ff] hover:bg-[#f0f5ff] transition-all rounded-md cursor-pointer group"
            >
              <svg
                className="w-5 h-5 mr-3 text-slate-400 group-hover:text-[#0055ff] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm font-bold text-slate-600 group-hover:text-[#0055ff] transition-colors tracking-wide">
                UPLOAD DOCUMENT TO AUTO-FILL
              </span>
            </label>
          </div>

          {selectedDocs.length > 0 && (
            <div className="mb-6 bg-[#f8fafc] border border-slate-200 p-4 rounded-md">
              <Label>Selected Documents for Generation</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDocs.map((doc) => (
                  <span
                    key={doc}
                    className="bg-white border border-slate-300 text-slate-700 px-2.5 py-1 text-xs rounded-full font-medium"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          <SectionHeader number="1" title="Property & Document Details" />
          <div className="bg-[#fcfdff] border border-slate-200 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Place of Execution</Label>
                <Input
                  name="placeOfExecution"
                  placeholder="e.g. Mumbai"
                  value={formData.placeOfExecution}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Society Name</Label>
                <Input
                  name="societyName"
                  placeholder="e.g. Sunrise CHS"
                  value={formData.societyName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Flat No.</Label>
                <Input
                  name="flatNo"
                  placeholder="e.g. 402"
                  value={formData.flatNo}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Building Address</Label>
                <Input
                  name="buildingAddress"
                  placeholder="e.g. Wing A"
                  value={formData.buildingAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Property Full Address</Label>
                <textarea
                  name="propertyAddress"
                  placeholder="Enter the complete address here..."
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 p-2.5 outline-none focus:border-[#0055ff] transition-colors text-slate-700 text-sm rounded-sm placeholder:text-slate-400 h-16 resize-none"
                />
              </div>
              <div>
                <Label>Share Certificate Number</Label>
                <Input
                  name="shareCertificateNumber"
                  placeholder="e.g. 1502"
                  value={formData.shareCertificateNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Distinctive From</Label>
                  <Input
                    type="number"
                    name="shareDistinctiveFrom"
                    placeholder="From"
                    value={formData.shareDistinctiveFrom}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Distinctive To</Label>
                  <Input
                    type="number"
                    name="shareDistinctiveTo"
                    placeholder="To"
                    value={formData.shareDistinctiveTo}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <SectionHeader number="2" title="Transaction Details" />
          <div className="bg-[#fcfdff] border border-slate-200 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Total Consideration Amount</Label>
                <Input
                  type="number"
                  name="totalConsideration"
                  placeholder="Amount in Rs."
                  value={formData.totalConsideration}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input
                  name="bankName"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bankName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 my-6" />

          <SectionHeader number="3" title="Seller Details" />
          <div className="bg-[#fcfdff] border border-slate-200 p-4 rounded-md mb-4 shadow-sm">
            <Label>Common Address For All Sellers</Label>
            <Input
              name="sellerAddress"
              placeholder="Enter the shared residential address here..."
              value={formData.sellerAddress}
              onChange={handleChange}
            />
          </div>

          {sellers.map((seller, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 p-4 rounded-md mb-4 shadow-sm relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#0055ff] font-bold text-xs tracking-widest uppercase">
                  Seller #{index + 1}
                </h3>
                {sellers.length > 1 && (
                  <button
                    onClick={() => removeSeller(index)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <select
                    value={seller.title}
                    onChange={(e) =>
                      updateSeller(index, "title", e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 p-2.5 outline-none focus:border-[#0055ff] text-slate-700 text-sm rounded-sm appearance-none cursor-pointer"
                  >
                    <option value="Shri">Shri</option>
                    <option value="Smt.">Smt.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="md:col-span-5">
                  <Label>Full Legal Name</Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={seller.name}
                    onChange={(e) =>
                      updateSeller(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    placeholder="Years"
                    value={seller.age}
                    onChange={(e) => updateSeller(index, "age", e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>PAN Card No.</Label>
                  <Input
                    placeholder="ABCDE1234F"
                    value={seller.pan}
                    onChange={(e) => updateSeller(index, "pan", e.target.value)}
                    className="uppercase"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addSeller}
            className="flex items-center gap-2 bg-[#f0f5ff] text-[#0055ff] text-xs font-bold px-4 py-2 rounded-sm hover:bg-[#e0edff] transition-colors mb-6"
          >
            <span className="text-lg leading-none font-normal">+</span> ADD
            ANOTHER SELLER
          </button>

          <hr className="border-slate-100 my-6" />

          <SectionHeader number="4" title="Purchaser Details" />
          <div className="bg-[#fcfdff] border border-slate-200 p-4 rounded-md mb-4 shadow-sm">
            <Label>Common Address For All Purchasers</Label>
            <Input
              name="purchaserAddress"
              placeholder="Enter the shared residential address here..."
              value={formData.purchaserAddress}
              onChange={handleChange}
            />
          </div>

          {purchasers.map((purchaser, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 p-4 rounded-md mb-4 shadow-sm relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#0055ff] font-bold text-xs tracking-widest uppercase">
                  Purchaser #{index + 1}
                </h3>
                {purchasers.length > 1 && (
                  <button
                    onClick={() => removePurchaser(index)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <select
                    value={purchaser.title}
                    onChange={(e) =>
                      updatePurchaser(index, "title", e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 p-2.5 outline-none focus:border-[#0055ff] text-slate-700 text-sm rounded-sm appearance-none cursor-pointer"
                  >
                    <option value="Shri">Shri</option>
                    <option value="Smt.">Smt.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="md:col-span-5">
                  <Label>Full Legal Name</Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={purchaser.name}
                    onChange={(e) =>
                      updatePurchaser(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    placeholder="Years"
                    value={purchaser.age}
                    onChange={(e) =>
                      updatePurchaser(index, "age", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>PAN Card No.</Label>
                  <Input
                    placeholder="ABCDE1234F"
                    value={purchaser.pan}
                    onChange={(e) =>
                      updatePurchaser(index, "pan", e.target.value)
                    }
                    className="uppercase"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addPurchaser}
            className="flex items-center gap-2 bg-[#f0f5ff] text-[#0055ff] text-xs font-bold px-4 py-2 rounded-sm hover:bg-[#e0edff] transition-colors mb-8"
          >
            <span className="text-lg leading-none font-normal">+</span> ADD
            ANOTHER PURCHASER
          </button>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
            <button
              onClick={() => navigate("/all-documents")}
              className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 text-sm rounded-md font-bold hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              className="bg-[#0055ff] text-white px-8 py-2.5 text-sm rounded-md font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              Generate Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentGenerator;
