import {CodeSave} from '../models/codeSaveModel.js';

export const saveCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const user = req.userId;

    const updated = await CodeSave.findOneAndUpdate(
      { user: user, problem: problemId, language },
      { code },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save code', message: err.message });
  }
};

export const getSavedCode = async (req, res) => {
  try {
    const { id, language } = req.params;
    const user = req.userId;

    const saved = await CodeSave.findOne({
      user: user,
      problem: id,
      language,
    });

    res.json({ code: saved?.code || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved code', message: err.message });
  }
};
