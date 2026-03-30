import express from "express";
import { runAIAssistPipeline } from "../pipelines/aiAssist.pipeline";

const router = express.Router();

router.post("/assist", async (req, res) => {
  try {
    const result = await runAIAssistPipeline(req.body);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
