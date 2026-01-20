const qrcode = require("qrcode");

/**
 * Generate QR payload (simple & safe)
 * No personal data
 */
const generateQRPayload = (registrationId, masterclassId) => {
  return JSON.stringify({
    registrationId,
    masterclassId,
    issuedAt: new Date().toISOString()
  });
};

/**
 * Generate QR image (base64 PNG)
 */
const generateQRCodeImage = async (payload) => {
  try {
    return await qrcode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2
    });
  } catch (err) {
    console.error("QR generation failed:", err);
    throw new Error("QR generation failed");
  }
};

/**
 * Main QR generator used across backend
 */
const generateCompleteQR = async (registrationId, masterclassId) => {
  const qrData = generateQRPayload(registrationId, masterclassId);
  const qrCode = await generateQRCodeImage(qrData);

  return {
    qrData,
    qrCode
  };
};

module.exports = {
  generateCompleteQR
};
