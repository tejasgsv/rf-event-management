const db = require('../config/database');
const Speaker = require('../models/Speaker');

/* ================= CREATE SPEAKER ================= */
exports.createSpeaker = async (req, res) => {
  try {
    const {
      name,
      title,
      designation,
      organization,
      bio,
      photo,
      email,
      linkedin,
      twitter
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Speaker name is required'
      });
    }

    const speaker = await Speaker.create({
      name,
      title,
      designation,
      organization,
      bio,
      photo,
      email,
      linkedin,
      twitter
    });

    res.status(201).json({
      success: true,
      data: speaker
    });
  } catch (error) {
    console.error('❌ Create speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create speaker',
      error: error.message
    });
  }
};

/* ================= GET ALL SPEAKERS ================= */
exports.getAllSpeakers = async (req, res) => {
  try {
    const speakers = await Speaker.find();

    res.json({
      success: true,
      data: speakers
    });
  } catch (error) {
    console.error('❌ Get speakers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speakers',
      error: error.message
    });
  }
};

/* ================= GET SINGLE SPEAKER ================= */
exports.getSpeakerById = async (req, res) => {
  try {
    const { id } = req.params;

    const speaker = await Speaker.findById(id);

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: 'Speaker not found'
      });
    }

    // Get speaker's masterclasses
    const masterclasses = await Speaker.getMasterclassesBySpeaker(id);

    res.json({
      success: true,
      data: {
        ...speaker,
        masterclasses
      }
    });
  } catch (error) {
    console.error('❌ Get speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speaker',
      error: error.message
    });
  }
};

/* ================= UPDATE SPEAKER ================= */
exports.updateSpeaker = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      title,
      designation,
      organization,
      bio,
      photo,
      email,
      linkedin,
      twitter
    } = req.body;

    const speaker = await Speaker.findById(id);

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: 'Speaker not found'
      });
    }

    const updated = await Speaker.findByIdAndUpdate(id, {
      name,
      title,
      designation,
      organization,
      bio,
      photo,
      email,
      linkedin,
      twitter
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('❌ Update speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update speaker',
      error: error.message
    });
  }
};

/* ================= DELETE SPEAKER ================= */
exports.deleteSpeaker = async (req, res) => {
  try {
    const { id } = req.params;

    const speaker = await Speaker.findById(id);

    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: 'Speaker not found'
      });
    }

    // Check if speaker is linked to any masterclasses
    const masterclasses = await Speaker.getMasterclassesBySpeaker(id);

    if (masterclasses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Speaker is linked to ${masterclasses.length} masterclass(es). Unlink before deleting.`,
        masterclasses: masterclasses.map(m => ({ id: m.id, title: m.title }))
      });
    }

    await Speaker.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Speaker deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete speaker',
      error: error.message
    });
  }
};

/* ================= UPLOAD SPEAKER PHOTO ================= */
exports.uploadSpeakerPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const speaker = await Speaker.findById(id);
    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: 'Speaker not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/speakers/${req.file.filename}`;

    const updated = await Speaker.findByIdAndUpdate(id, {
      photo: fileUrl
    });

    return res.status(201).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        speaker: updated || { ...speaker, photo: fileUrl }
      }
    });
  } catch (error) {
    console.error('❌ Upload speaker photo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
};

/* ================= LINK SPEAKER TO MASTERCLASS ================= */
exports.linkSpeakerToMasterclass = async (req, res) => {
  try {
    const { speakerId, masterclassId } = req.body;
    const { orderIndex, role } = req.body;

    if (!speakerId || !masterclassId) {
      return res.status(400).json({
        success: false,
        message: 'speakerId and masterclassId are required'
      });
    }

    // Verify speaker exists
    const speaker = await Speaker.findById(speakerId);
    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: 'Speaker not found'
      });
    }

    // Verify masterclass exists
    const [masterclasses] = await db.query(
      'SELECT id FROM masterclasses WHERE id = ?',
      [masterclassId]
    );

    if (masterclasses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Masterclass not found'
      });
    }

    await Speaker.linkToMasterclass(speakerId, masterclassId, orderIndex || 0, role || 'SPEAKER');

    res.json({
      success: true,
      message: 'Speaker linked to masterclass successfully'
    });
  } catch (error) {
    console.error('❌ Link speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link speaker to masterclass',
      error: error.message
    });
  }
};

/* ================= UNLINK SPEAKER FROM MASTERCLASS ================= */
exports.unlinkSpeakerFromMasterclass = async (req, res) => {
  try {
    const { speakerId, masterclassId } = req.body;

    if (!speakerId || !masterclassId) {
      return res.status(400).json({
        success: false,
        message: 'speakerId and masterclassId are required'
      });
    }

    await Speaker.unlinkFromMasterclass(speakerId, masterclassId);

    res.json({
      success: true,
      message: 'Speaker unlinked from masterclass successfully'
    });
  } catch (error) {
    console.error('❌ Unlink speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink speaker from masterclass',
      error: error.message
    });
  }
};

/* ================= GET SPEAKERS BY MASTERCLASS ================= */
exports.getSpeakersByMasterclass = async (req, res) => {
  try {
    const { masterclassId } = req.params;

    const speakers = await Speaker.findByMasterclassId(masterclassId);

    res.json({
      success: true,
      data: speakers
    });
  } catch (error) {
    console.error('❌ Get speakers by masterclass error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speakers',
      error: error.message
    });
  }
};
