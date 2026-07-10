const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Agreement",
    },

    agreementForm: {
      type: Object,
      default: {},
    },

    ownershipHistory: {
      type: String,
      default: "",
    },

    finalAgreement: {
      type: String,
      default: "",
    },

    uploadedDocuments: [
      {
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
    ],

    status: {
      type: String,
      default: "Draft",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Agreement", agreementSchema);
