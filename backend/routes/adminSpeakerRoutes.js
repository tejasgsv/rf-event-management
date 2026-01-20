const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const controller = require("../controllers/adminSpeakerController");
const authAdmin = require("../middleware/authAdmin");

const uploadDir = path.join(__dirname, "..", "uploads", "speakers");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname) || ".png";
		const safeName = `speaker-${Date.now()}-${Math.round(
			Math.random() * 1e9
		)}${ext}`;
		cb(null, safeName);
	},
});

const fileFilter = (_req, file, cb) => {
	if (!file.mimetype.startsWith("image/")) {
		return cb(new Error("Only image files are allowed"), false);
	}
	cb(null, true);
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
});

// 🔐 Admin only
router.use(authAdmin);

// CRUD operations
router.post("/speakers/:id/photo", upload.single("photo"), controller.uploadSpeakerPhoto);
router.post("/speakers", controller.createSpeaker);
router.get("/speakers", controller.getAllSpeakers);
router.get("/speakers/:id", controller.getSpeakerById);
router.put("/speakers/:id", controller.updateSpeaker);
router.delete("/speakers/:id", controller.deleteSpeaker);

// Link/unlink speakers to masterclasses
router.post("/speakers/link", controller.linkSpeakerToMasterclass);
router.post("/speakers/unlink", controller.unlinkSpeakerFromMasterclass);
router.get("/speakers/masterclass/:masterclassId", controller.getSpeakersByMasterclass);

module.exports = router;
