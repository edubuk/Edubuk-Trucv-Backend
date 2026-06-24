
import { syncSearchProfile } from "./searchProfile.controller";
import { User } from "../models/user.model";
import { ObjectId } from "mongoose";


// ---------Do not run it and dont touch it-------------------------
export default async function backfillSearchProfiles() {
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



// ---------Do not run it and dont touch it-------------------------

// export async function updateUserImageBaseUrl(){
//   try {
//     await User.updateMany(
//   {
//     userImageUrl: {
//       $regex: "^https://trucvstorage\\.blob\\.core\\.windows\\.net",
//     },
//   },
//   [
//     {
//       $set: {
//         userImageUrl: {
//           $replaceOne: {
//             input: "$userImageUrl",
//             find: "https://trucvstorage.blob.core.windows.net",
//             replacement: "https://trucvstorageaccount.blob.core.windows.net",
//           },
//         },
//       },
//     },
//   ]
// );
//     console.log("Done updating user image base url");
//   } catch (error) {
//     console.error("Error updating user image base url", error);
//   }
// }

