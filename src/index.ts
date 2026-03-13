import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

const CASE_MCP_URL = "http://localhost:5050";

/**
 * TEST DEBUG VERSION
 * Patient Intake Endpoint
 */
app.post("/clinical/intake", async (req: Request, res: Response) => {
  try {

    console.log("---- INTAKE REQUEST RECEIVED ----");
    console.log("Request Body:", req.body);

    const { omang } = req.body;

    if (!omang) {
      console.error("OMANG missing from request");
      return res.status(400).json({
        error: "OMANG required"
      });
    }

    console.log("OMANG validated:", omang);

    /**
     * STEP 1
     * Create patient in Case MCP
     */
    console.log("Calling Case MCP → createPatient");

    const patientResponse = await axios.post(
      `${CASE_MCP_URL}/patients`,
      { omang }
    );

    console.log("Patient creation result:", patientResponse.data);

    const patientId = patientResponse.data.patientId;

    if (!patientId) {
      console.error("Patient ID missing from MCP response");
      throw new Error("Patient creation failed");
    }

    /**
     * STEP 2
     * Create encounter
     */
    console.log("Calling Case MCP → createEncounter");

    const encounterResponse = await axios.post(
      `${CASE_MCP_URL}/encounters`,
      { patientId }
    );

    console.log("Encounter creation result:", encounterResponse.data);

    const encounterId = encounterResponse.data.encounterId;

    if (!encounterId) {
      console.error("Encounter ID missing");
      throw new Error("Encounter creation failed");
    }

    console.log("---- INTAKE SUCCESS ----");

    return res.json({
      patientId,
      encounterId
    });

  } catch (error: any) {

    console.error("INTAKE ERROR");
    console.error(error?.response?.data || error.message);

    return res.status(500).json({
      error: "Patient intake failed"
    });

  }
});

app.listen(8087, () => {
  console.log("AI Orchestrator running on port 8087");
});
