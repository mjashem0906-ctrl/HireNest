require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const migrateServicesToJobs = async () => {
  try {
    const connString = process.env.CONNECTION_STRING;
    if (!connString) {
      console.error("❌ ERROR: CONNECTION_STRING is not set in environment variables.");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(connString);
    console.log("✅ Connected to MongoDB successfully.");

    const db = mongoose.connection.db;
    const servicesCollection = db.collection('services');
    const jobsCollection = db.collection('jobs');

    // Drop stale/obsolete unique index link_1 if it exists on jobs collection
    try {
      await jobsCollection.dropIndex('link_1');
      console.log("🧹 Dropped obsolete index 'link_1' from 'jobs' collection.");
    } catch (e) {
      // Ignore if index does not exist
    }

    const totalServices = await servicesCollection.countDocuments();
    console.log(`📦 Found ${totalServices} document(s) in 'services' collection.`);

    if (totalServices === 0) {
      console.log("ℹ️ No documents found in 'services' collection to migrate.");
    } else {
      const servicesDocs = await servicesCollection.find({}).toArray();
      let migratedCount = 0;

      for (const doc of servicesDocs) {
        // Upsert into jobs collection keeping exact _id and all fields intact
        await jobsCollection.replaceOne(
          { _id: doc._id },
          doc,
          { upsert: true }
        );
        migratedCount++;
      }

      console.log(`✅ Successfully migrated ${migratedCount} document(s) from 'services' to 'jobs' collection.`);
    }

    const totalJobs = await jobsCollection.countDocuments();
    console.log(`📊 Total document(s) now in 'jobs' collection: ${totalJobs}`);

    console.log("🎉 Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
};

migrateServicesToJobs();
