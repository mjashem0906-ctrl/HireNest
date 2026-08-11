const mongoose = require('mongoose');

const syncMemberTypes = async () => {
  try {
    const Member = require('../models/member');
    const Recruiter = require('../models/Recruiter');
    const Referee = require('../models/Referee');

    // 1. Sync Recruiters to Members collection
    const recruiters = await Recruiter.find().lean();
    for (const r of recruiters) {
      if (!r.email) continue;
      const cleanEmail = String(r.email).trim().toLowerCase();
      const existingMember = await Member.findOne({
        $or: [
          { email: cleanEmail },
          { email: r.email }
        ]
      });

      const memberData = {
        name: r.fullName || r.name || 'Recruiter',
        email: r.email,
        mobileNumber: r.phone || r.phoneNumber || r.mobileNumber || '',
        memberType: 'Oppurtunity Provider',
        designation: r.designation || 'Recruiter',
        department: r.department || '',
        currentInstitutionOrCompany: r.companyName || '',
        companyName: r.companyName || '',
        companyGST: r.companyGST || '',
        companyEmail: r.companyEmail || r.email,
        district: r.location || r.district || 'Location N/A',
        location: r.location || r.district || 'Location N/A',
        industries: Array.isArray(r.industries) ? r.industries : (r.industries ? [r.industries] : []),
        hiringVolume: r.hiringVolume || '',
        teamSize: r.teamSize || '',
        employeeId: r.employeeId || 'N/A',
        memberReferenceNumber: r.memberReferenceNumber || null,
        symMemberStatus: 'Yes',
        solidarityMember: 'Yes',
      };

      if (existingMember) {
        await Member.findByIdAndUpdate(existingMember._id, {
          $set: {
            ...memberData,
            memberType: existingMember.memberType || 'Oppurtunity Provider'
          }
        });
      } else {
        await Member.create(memberData);
      }
    }

    // 2. Sync Referees to Members collection
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
        symMemberStatus: 'Yes',
        solidarityMember: 'Yes',
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

    console.log('✅ Synchronized all Mentors, Job Recruiters, and Job Referees to Members collection');
  } catch (err) {
    console.error('Error syncing member types to Members collection:', err);
  }
};

module.exports = syncMemberTypes;
