const mongoose = require('mongoose');

const syncMemberTypes = async () => {
  try {
    const Member = require('../models/member');
    const Referee = require('../models/Referee');

    // Sync Referees to Members collection
    const referees = await Referee.find().lean();
    for (const ref of referees) {
      if (!ref.email) continue;
      const cleanEmail = String(ref.email).trim().toLowerCase();
      const existingMember = await Member.findOne({
        $or: [
          { email: cleanEmail },
          { email: ref.email }
        ]
      });

      const refereeData = {
        name: ref.name || 'Referee',
        email: ref.email,
        mobileNumber: ref.phoneNumber || ref.mobileNumber || '',
        memberType: 'Referee',
        gender: ref.gender || '',
        occupation: ref.occupation || '',
        companyDetails: ref.companyDetails || '',
        referrerStatus: ref.referrerStatus || 'Interested in joining',
        referringOfferType: ref.referringOfferType || '',
        referringSector: ref.referringSector || '',
        referringFor: ref.referringFor || '',
        levelOfSupport: ref.levelOfSupport || '',
        district: ref.district || '',
        age: ref.age || '',
        photoUrl: ref.photoUrl || '',
        memberReferenceNumber: ref.memberReferenceNumber || null,
        referrerContact: ref.referrerContact || '',
        declaration_Referee: ref.declaration_Referee || false,
        ...(ref.symMemberStatus || ref.solidarityMember ? {
          symMemberStatus: ref.symMemberStatus || ref.solidarityMember,
          solidarityMember: ref.solidarityMember || ref.symMemberStatus,
        } : {}),
      };

      if (existingMember) {
        await Member.findByIdAndUpdate(existingMember._id, {
          $set: {
            ...refereeData,
            memberType: existingMember.memberType || 'Referee'
          }
        });
      } else {
        await Member.create(refereeData);
      }
    }

    console.log('✅ Synchronized Job Referees to Members collection');
  } catch (err) {
    console.error('Error syncing member types to Members collection:', err);
  }
};

module.exports = syncMemberTypes;
