const User = require("../models/login");
const GoogleUser = require("../models/googleUser");
const Member = require("../models/member");

/**
 * Migration utility:
 * 1. Move Google Sign-In users from 'users' collection to 'googleusers' collection.
 * 2. Populate and synchronize googleId in the corresponding Members document.
 */
async function migrateGoogleUsers() {
  try {
    // ── Step 1: Migrate Google users from 'users' collection to 'googleusers' collection ──
    const googleUserDocs = await User.find({
      googleId: { $exists: true, $ne: null, $ne: "" },
    });

    if (googleUserDocs.length > 0) {
      console.log(
        `[Migration] Found ${googleUserDocs.length} Google user(s) in 'users' collection. Starting migration...`
      );

      for (const doc of googleUserDocs) {
        try {
          const docObj = doc.toObject();
          delete docObj.__v;

          // Check if a record with this googleId or _id already exists in googleusers
          let existingGoogleUser = await GoogleUser.findOne({
            $or: [{ _id: docObj._id }, { googleId: docObj.googleId }],
          });

          if (existingGoogleUser) {
            // Update existing GoogleUser document
            if (docObj.memberId && !existingGoogleUser.memberId) {
              existingGoogleUser.memberId = docObj.memberId;
            }
            if (docObj.role) existingGoogleUser.role = docObj.role;
            if (docObj.profileCompleted) existingGoogleUser.profileCompleted = docObj.profileCompleted;
            await existingGoogleUser.save();
          } else {
            // Create new GoogleUser record
            await GoogleUser.create(docObj);
          }

          // Remove migrated record from 'users' collection
          await User.deleteOne({ _id: docObj._id });
          console.log(
            `[Migration] Migrated user ${docObj._id} (${docObj.username}) to 'googleusers' collection.`
          );
        } catch (itemErr) {
          console.error(
            `[Migration Warning] Error migrating user ${doc._id} (${doc.username}):`,
            itemErr.message
          );
          // If duplicate key error, remove from 'users' as it already exists in 'googleusers'
          if (itemErr.code === 11000) {
            await User.deleteOne({ _id: doc._id });
          }
        }
      }

      console.log(
        `[Migration] Successfully processed migration of ${googleUserDocs.length} user(s).`
      );
    } else {
      console.log("[Migration] No Google users remaining in 'users' collection to migrate.");
    }

    // ── Step 2: Populate & synchronize googleId on linked Member documents ──
    const allGoogleUsers = await GoogleUser.find({
      googleId: { $exists: true, $ne: null, $ne: "" },
    });

    console.log(
      `[Migration] Syncing googleId for ${allGoogleUsers.length} Google user(s) to 'members' collection...`
    );

    let syncedCount = 0;
    for (const gUser of allGoogleUsers) {
      try {
        let linkedMember = null;

        if (gUser.memberId) {
          linkedMember = await Member.findById(gUser.memberId);
        }

        // If no linked member by ID, try matching by email
        if (!linkedMember && gUser.username) {
          linkedMember = await Member.findOne({
            $or: [
              { email: gUser.username.trim().toLowerCase() },
              { submittingEmail: gUser.username.trim().toLowerCase() },
            ],
          });

          if (linkedMember) {
            // Link memberId back to GoogleUser
            gUser.memberId = linkedMember._id;
            await gUser.save();
            console.log(
              `[Migration] Linked GoogleUser ${gUser._id} to existing Member ${linkedMember._id}`
            );
          }
        }

        // Sync googleId to Member record
        if (linkedMember) {
          if (linkedMember.googleId !== gUser.googleId) {
            linkedMember.googleId = gUser.googleId;
            await linkedMember.save();
            syncedCount++;
            console.log(
              `[Migration] Populated googleId (${gUser.googleId}) on Member ${linkedMember._id} (${linkedMember.name || linkedMember.email})`
            );
          }
        }
      } catch (syncErr) {
        console.error(
          `[Migration Warning] Error syncing googleId for GoogleUser ${gUser._id}:`,
          syncErr.message
        );
      }
    }

    console.log(
      `[Migration] Synchronization complete. ${syncedCount} Member record(s) updated with googleId.`
    );
  } catch (error) {
    console.error("[Migration Error] Failed to migrate/sync Google users:", error);
  }
}

module.exports = migrateGoogleUsers;
