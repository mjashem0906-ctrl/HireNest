const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GoogleUser = require("../models/googleUser");
const Member = require("../models/member");

// Helper: calculate profile completion % from a Member document
function calcProfileCompleted(member) {
  const hasValue = (v) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && String(v).trim().length > 0;
  };
  const fields = [
    hasValue(member.name),
    hasValue(member.mobileNumber),
    hasValue(member.gender),
    hasValue(member.dateOfBirth),
    hasValue(member.photoUrl),
    hasValue(member.district),
    hasValue(member.designation),
    hasValue(member.workExp),
    hasValue(member.careerProfile?.role),
    hasValue(member.careerProfile?.industry),
    hasValue(member.skills),
    hasValue(member.resumeLink),
    hasValue(member.highest_education),
    hasValue(member.branch),
    hasValue(member.passOutYear),
    hasValue(member.fatherName),
    hasValue(member.address || member.hometown),
    hasValue(member.languages),
    hasValue(member.maritalStatus),
    hasValue(member.employmentType || member.careerProfile?.employmentType),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // ── 1. Find or create in GoogleUser (googleusers collection) ──
        let user = await GoogleUser.findOne({
          $or: [{ googleId }, { username: email }],
        });

        if (!user) {
          user = await GoogleUser.create({
            username: email,
            googleId,
            role: "Candidate",
            profileCompleted: 0,
          });
        } else if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }

        // ── 2. Auto-link pre-imported Member data & sync googleId ──
        if (!user.memberId) {
          const existingMember = await Member.findOne({
            $or: [{ email: email }, { submittingEmail: email }],
          });

          if (existingMember) {
            console.log(
              `[GoogleAuth] Linking existing Member (${existingMember._id}) to User ${user._id} (${email})`
            );

            user.memberId = existingMember._id;

            // Recalculate completion from actual member data
            user.profileCompleted = calcProfileCompleted(existingMember);

            // Honour existing memberType role if still default
            if (user.role === "Candidate" && existingMember.memberType) {
              const typeToRole = {
                "Job Seeker": "Candidate",
                "Mentor": "Mentor",
                "Recruiter": "Candidate",
                "Referee": "Candidate",
              };
              user.role = typeToRole[existingMember.memberType] || "Candidate";
            }

            // Sync googleId to Member record
            existingMember.googleId = googleId;
            await existingMember.save();

            await user.save();
          }
        } else {
          // Keep googleId synced on existing linked Member record
          const linkedMember = await Member.findById(user.memberId);
          if (linkedMember && linkedMember.googleId !== googleId) {
            linkedMember.googleId = googleId;
            await linkedMember.save();
          }
        }

        return done(null, user);
      } catch (err) {
        console.error("Auth Error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
