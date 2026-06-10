
import { syncSearchProfile } from "./searchProfile.controller";
import { User } from "../models/user.model";
import { ObjectId } from "mongoose";

export async function backfillSearchProfiles() {
  const users = await User.find({}, "_id");

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    try {
      await syncSearchProfile(
        (user._id as ObjectId).toString()
      );

      console.log(
        `Synced ${user._id}`
      );
    } catch (error) {
      console.error(
        `Failed ${user._id}`,
        error
      );
    }
  }

  console.log("Done");
}

