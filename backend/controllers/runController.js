import axios from "axios";

export const runCode = async (req, res) => {
  const { code, language, input = "" } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      success: false,
      message: "Code and language are required",
    });
  }

  try {
    const compilerResponse = await axios.post("http://localhost:5001/api/run/", {
      code,
      language,
      input,
    });

    const { success, output, error, time } = compilerResponse.data;

    return res.status(success ? 200 : 400).json({
      success,
      output,
      error,
      time,
    });

  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({
      success: false,
      output: null,
      error: err.response?.data?.error || err.message || "Unknown error",
      time: null,
    });
  }
};
