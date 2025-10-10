import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/Users";

export const inngest = new Inngest({ id: "E-commerce-nextjs" });

//Inngest funct to save data in database

export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_address[0].email_address,
      name: first_name + "" + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    await User.create(userData);
  }
);

// Inngest function to update data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_address[0].email_address,
      name: first_name + "" + last_name,
      imageUrl: image_url,
    };
    await connectDB();
    User.findByIdAndUpdate(id, userData);
  }
);
// Inngest function to delete user fom database
export const synUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdANDDelete(id);
  }
);
