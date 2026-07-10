import { useNavigate } from "react-router-dom";

function OwnershipHistory() {
  const navigate = useNavigate();

  const history = [
    {
      seller: "Amit Patel",
      purchaser: "Rajesh Shah",
      date: "15/06/2018",
      registrationNumber: "ABC123",
    },
    {
      seller: "Rajesh Shah",
      purchaser: "Om Patil",
      date: "10/02/2024",
      registrationNumber: "XYZ789",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-5xl text-center text-blue-600 mb-10">
          Ownership History
        </h1>

        {history.map((item, index) => (
          <div key={index} className="border rounded-3xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Transfer #{index + 1}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={item.seller}
                readOnly
                className="border p-3 rounded-xl"
              />

              <input
                value={item.purchaser}
                readOnly
                className="border p-3 rounded-xl"
              />

              <input
                value={item.date}
                readOnly
                className="border p-3 rounded-xl"
              />

              <input
                value={item.registrationNumber}
                readOnly
                className="border p-3 rounded-xl"
              />
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/generate-agreement")}
            className="bg-blue-600 text-white px-10 py-4 rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default OwnershipHistory;
