import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
getToken().then(token => console.log(token));
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Find user by Clerk userId, not MongoDB _id
    const user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      // Create a new user if not found
      const newUser = new User({
        clerkUserId: userId,
        email: user?.emailAddresses?.[0]?.emailAddress,
        cartItems: {}
      });
      await newUser.save();
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in /api/user/data:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}