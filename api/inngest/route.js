import { serve } from "inngest/next";
import {
  inngest,
  syncUserCreation,
  syncUserUpdation,
  synUserDeletion,
} from "@/config/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [synUserDeletion, syncUserUpdation, syncUserCreation],
});
//
