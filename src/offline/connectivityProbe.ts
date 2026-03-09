import axios from "axios";
import { getIdToken } from "../utils/googleAuth.js";

/*
================================================
REGIONAL CONNECTIVITY PROBE
================================================
Checks whether regional infrastructure is reachable
*/

export async function isRegionalOnline(
  gatewayUrl: string
  ): Promise<boolean> {

    try {

        const token = await getIdToken(gatewayUrl);

            const response = await axios.get(
                  `${gatewayUrl}/health`,
                        {
                                headers: {
                                          Authorization: `Bearer ${token}`
                                                  },
                                                          timeout: 1000
                                                                }
                                                                    );

                                                                        return response.status === 200;

                                                                          } catch {

                                                                              return false;

                                                                                }

                                                                                }