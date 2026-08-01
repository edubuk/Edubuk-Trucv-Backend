
import { syncSearchProfile } from "./searchProfile.controller";
import { User } from "../models/user.model";
import { ObjectId } from "mongoose";
import { EducationDoc } from "../models/education.model";
import { ExperienceDoc } from "../models/experience.model";
import { AwardDocs } from "../models/award.model";


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


export async function updateDocBaseUrl(){
  try{
    await EducationDoc.updateMany(
  {
    docUri: {
      $exists: true,
      $nin: [null, ""]
    }
  },
  [
    {
      $set: {
        docUri: {
          $replaceOne: {
            input: "$docUri",
            find: "https://trucvstorage.blob.core.windows.net",
            replacement: "https://trucvstorageaccount.blob.core.windows.net"
          }
        }
      }
    }
  ]
);
console.log("Done updating doc base url");
  }catch(error){
    console.error("Error updating doc base url", error);
  }
}

