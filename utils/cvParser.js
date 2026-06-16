/**
 * cvParser.js
 * Extracts structured profile fields from a resume file (PDF or DOCX).
 * Handles spaced-letter PDF fonts common in Indian resumes.
 */

// ── Top-level imports ─────────────────────────────────────────────────────────
process.env.ALLOW_LEGACY_MJS = "1";

let pdfParse;
try {
  pdfParse = require("pdf-parse");
  if (typeof pdfParse !== "function" && typeof pdfParse.default === "function") {
    pdfParse = pdfParse.default;
  }
  console.log("[cvParser] pdf-parse loaded, type:", typeof pdfParse);
} catch (e) {
  console.error("[cvParser] pdf-parse not available:", e.message);
}

let mammoth;
try {
  mammoth = require("mammoth");
} catch (e) {
  console.error("[cvParser] mammoth not available:", e.message);
}

// ── Degree keywords (highest → lowest) ───────────────────────────────────────
const DEGREE_KEYWORDS = [
  "PhD", "Ph.D", "Doctor",
  "M.Tech", "M.E", "M.B.A", "MBA", "M.Sc", "M.A", "M.Com", "M.C.A", "MCA",
  "M.S.W", "LLM", "M.Pharm", "MPT", "MD", "MS", "Post Graduate Diploma", "PGD",
  "B.Tech", "B.E", "B.Sc", "B.A", "B.Com", "B.B.A", "BBA", "B.C.A", "BCA",
  "B.S.W", "B.Voc", "B.Arch", "LLB", "B.Pharm", "D.Pharm", "BPT", "BDS",
  "MBBS", "BAMS", "BHMS",
  "Diploma", "Polytechnic", "ITI", "PUC", "HSC", "12th", "SSLC", "10th",
  "Certification Course",
];

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

// ── PDF text extraction ───────────────────────────────────────────────────────
async function extractPdfText(buffer) {
  if (!pdfParse || typeof pdfParse !== "function") {
    console.error("[cvParser] pdf-parse not a function, type:", typeof pdfParse);
    return "";
  }
  try {
    const data = await pdfParse(buffer, { max: 0 });
    const text = data.text || "";
    console.log(`[cvParser] PDF extracted ${text.length} chars`);
    return text;
  } catch (err) {
    console.error("[cvParser] PDF extraction error:", err.message);
    return "";
  }
}

// ── DOCX text extraction ──────────────────────────────────────────────────────
async function extractDocxText(buffer) {
  if (!mammoth) { return ""; }
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (err) {
    console.error("[cvParser] DOCX extraction error:", err.message);
    return "";
  }
}

// ── Spaced-letter normalizer ──────────────────────────────────────────────────
function normalizeSpacedLetters(rawText) {
  return rawText.replace(/^[^\n]*(?:[A-Za-z] ){3,}[A-Za-z][^\n]*/gm, (line) => {
    const segments = line.trim().split(/ {2,}/);
    const collapsed = segments.map((seg) => {
      const trimmed = seg.trim();
      if (/^([A-Za-z]+ ){2,}[A-Za-z]+$/.test(trimmed) &&
          trimmed.split(" ").every((w) => w.length <= 2)) {
        return trimmed.replace(/ /g, "");
      }
      return seg;
    });
    return collapsed.join(" ");
  });
}

// ── Date string parser helper ────────────────────────────────────────────────
function parseDateToYMD(dateStr) {
  if (!dateStr) return "";
  const cleanStr = dateStr.trim().toLowerCase();
  if (
    cleanStr === "present" ||
    cleanStr === "till date" ||
    cleanStr === "now" ||
    cleanStr === "current" ||
    cleanStr === "till now"
  ) {
    return "";
  }

  // Check if it's purely numeric like DD.MM.YYYY or MM.YYYY or MM/YYYY
  const numericMatch = cleanStr.match(/(?:(\d{1,2})[.\-\/])?(\d{1,2})[.\-\/](\d{2,4})/);
  if (numericMatch) {
    const day = numericMatch[1] ? parseInt(numericMatch[1], 10) : 1;
    const month = parseInt(numericMatch[2], 10);
    let year = parseInt(numericMatch[3], 10);
    if (year < 100) {
      year = year + 2000;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Month names mapping
  const monthNamesMap = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };

  const wordMatch = cleanStr.match(/(?:(\d{1,2})\s+)?([a-z]{3,9})[.\-\/',\s]*(\d{2,4})/);
  if (wordMatch) {
    const day = wordMatch[1] ? parseInt(wordMatch[1], 10) : 1;
    const monthName = wordMatch[2];
    const month = monthNamesMap[monthName] || 1;
    let year = parseInt(wordMatch[3], 10);
    if (year < 100) {
      year = year + 2000;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return "";
}

// ── Notice period normalizer helper ──────────────────────────────────────────
function normalizeNoticePeriod(val) {
  if (!val) return "";
  const s = val.toLowerCase().trim();
  if (s.includes("immediate")) return "Immediate";
  if (s.includes("15")) return "15 days";
  if (s.includes("30") || s.includes("1 month") || s.includes("one month")) return "30 days";
  if (s.includes("45")) return "45 days";
  if (s.includes("60") || s.includes("2 month") || s.includes("two month")) return "60 days";
  if (s.includes("90") || s.includes("3 month") || s.includes("three month")) return "90 days";
  return val;
}

// ── Field extraction ──────────────────────────────────────────────────────────
function parseFields(rawText, buffer) {
  const text = normalizeSpacedLetters(rawText);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fullText = text;

  const parsed = {
    name: "",
    mobileNumber: "",
    email: "",
    linkedinUrl: "",
    highest_education: "",
    passOutYear: "",
    workExp: "",
    designation: "",
    currentInstitutionOrCompany: "",
    fieldofStudy_Interest: "",
    skills: [],
    district: "",
    gender: "",
    languages: [],
    experienceDetails: [],
    // New advanced fields
    fatherName: "",
    motherName: "",
    dateOfBirth: null,
    maritalStatus: "",
    hometown: "",
    pincode: "",
    address: "",
    careerProfile: {
      location: "",
      role: [],
      industry: "",
      employmentType: "",
      expectedSalary: "",
      noticePeriod: "",
    },
    certifications: [],
  };

  // ── Name ──────────────────────────────────────────────────────────────────────
  const SECTION_WORDS = /^(resume|curriculum|vitae|cv|profile|summary|objective|education|experience|skills?|technical|projects?|achievements?|contact|about|declaration|references?|languages?|hobbies|interests?|workshops?|certified|courses?)/i;

  for (const line of lines.slice(0, 15)) {
    if (
      line.length >= 2 &&
      line.length <= 80 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes("www.") &&
      !line.includes("CGPA") &&
      !line.includes("Percentage") &&
      !line.includes(":") &&
      !line.match(/^\d{4}/) &&
      !line.includes(",") &&
      !SECTION_WORDS.test(line) &&
      /[a-zA-Z]/.test(line) &&
      !/^[\d\+\-\(\)\|\*#•]/.test(line) &&
      (line.match(/[a-zA-Z]{2,}/g) || []).length >= 1
    ) {
      parsed.name = line.trim();
      break;
    }
  }

  // ── Mobile Number ─────────────────────────────────────────────────────────────
  const mobilePatterns = [
    /(?:mobile|phone|cell|mob|ph|contact)\s*[:\-#]?\s*(?:\+91|91|0)?[\s\-.]?([6-9]\d{9})/i,
    /(?:\+91|91|0)[\s\-.]?([6-9]\d{9})/,
    /\b([6-9]\d{9})\b/,
  ];
  for (const pat of mobilePatterns) {
    const m = fullText.match(pat);
    if (m) { parsed.mobileNumber = m[1]; break; }
  }

  // ── Email ─────────────────────────────────────────────────────────────────────
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) parsed.email = clean(emailMatch[0]);

  // ── LinkedIn URL ──────────────────────────────────────────────────────────────
  const linkedinPatterns = [
    /https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_\-%.]+)\/?/i,
    /(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_\-%.]+)\/?/i,
    /(?:www\.)?linkedin\.com\/([a-zA-Z0-9_\-%.]{4,})\/?/i,
  ];
  for (const pat of linkedinPatterns) {
    const m = fullText.match(pat);
    if (m) {
      parsed.linkedinUrl = `https://www.linkedin.com/in/${m[1]}`;
      break;
    }
  }

  // Fallback: Check PDF binary annotations for LinkedIn
  if (!parsed.linkedinUrl && buffer) {
    try {
      const binaryText = buffer.toString("binary");
      const uriRegex = /\/URI\s*\((https?:\/\/(?:www\.)?linkedin\.com\/in\/[^)]+)\)/gi;
      const m = uriRegex.exec(binaryText);
      if (m) {
        parsed.linkedinUrl = m[1];
      }
    } catch (e) {
      console.error("[cvParser] PDF binary link extraction error:", e.message);
    }
  }

  // ── Work Experience ────────────────────────────────────────────────────────────
  const expPatterns = [
    /(?:years?\s+(?:of\s+)?experience|experience\s+\(years\)|total\s+experience)\s*[:\-]?\s*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*\+?\s*years?\s+(?:of\s+)?(?:experience|work\s+experience|exp)/i,
    /(?:experience|exp)\s*[:\-]?\s*(\d+\.?\d*)\s*\+?\s*years?/i,
    /(\d+\.?\d*)\s*yrs?\s+(?:of\s+)?(?:experience|exp)/i,
    /total\s+(?:work\s+)?experience\s*[:\-]?\s*(\d+\.?\d*)/i,
  ];
  for (const pat of expPatterns) {
    const m = fullText.match(pat);
    if (m) { parsed.workExp = String(Math.round(parseFloat(m[1]))); break; }
  }

  // Fallback: count employment date ranges to estimate years
  if (!parsed.workExp) {
    const monthsStr = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december";
    const dateRegexPart = `(?:(?:\\d{1,2}[.\\-\\/])?\\b(?:\\d{1,2}|${monthsStr})\\b[.\\-\\/',\\s]*(?:\\d{4}|'\\d{2}|\\b\\d{2}\\b))`;
    const fallbackRangeRegex = new RegExp(
      `(${dateRegexPart})\\s*(?:-|–|—|to)\\s*(present|till\\s+date|now|current|till\\s+now)`,
      "gi"
    );
    const dateRangeMatches = fullText.match(fallbackRangeRegex);
    if (dateRangeMatches && dateRangeMatches.length > 0) {
      const years = dateRangeMatches.map(r => {
        const m = r.match(/(\d{4})/);
        return m ? parseInt(m[1]) : null;
      }).filter(Boolean);
      if (years.length > 0) {
        const minYear = Math.min(...years);
        const currentYear = new Date().getFullYear();
        const exp = Math.max(0, currentYear - minYear);
        if (exp <= 50) parsed.workExp = String(exp);
      }
    }
  }

  // ── Highest Education ─────────────────────────────────────────────────────────
  for (const degree of DEGREE_KEYWORDS) {
    const escaped = degree.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const noDots  = degree.replace(/\./g, "");
    const pattern = new RegExp(`\\b(?:${escaped}|${noDots})\\b`, "i");
    if (pattern.test(fullText)) {
      parsed.highest_education = degree;
      break;
    }
  }

  // ── Pass-out Year ─────────────────────────────────────────────────────────────
  if (parsed.highest_education) {
    const escaped = parsed.highest_education.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const noDots  = parsed.highest_education.replace(/\./g, "");
    const degreeLinePattern = new RegExp(`.*(?:${escaped}|${noDots}).*`, "i");
    for (const line of lines) {
      if (degreeLinePattern.test(line)) {
        const yearMatch = line.match(/\b(19\d{2}|20[0-2]\d|2030)\b/);
        if (yearMatch) {
          parsed.passOutYear = yearMatch[1];
          break;
        }
      }
    }
  }

  // ── Designation / Job Title ────────────────────────────────────────────────────
  const desigPatterns = [
    /(?:designation|position|current\s+(?:position|role|designation)|job\s+title)\s*[:\-]\s*(.+)/i,
    /(?:working\s+as|currently\s+working\s+as|work\s+as)\s+(?:a\s+)?(.+?)(?:\n|at\b|in\b|,|$)/i,
  ];
  for (const pat of desigPatterns) {
    const m = fullText.match(pat);
    if (m) {
      const val = clean(m[1]).split(/[\n|,]/)[0].slice(0, 80);
      if (val.length > 2) { parsed.designation = val; break; }
    }
  }
  if (!parsed.designation) {
    const jobTitleFallback = fullText.match(
      /\n([A-Za-z][A-Za-z\s\/&]{2,50})\n\d{2}[.\-\/]\d{2}[.\-\/]\d{4}/
    );
    if (jobTitleFallback) {
      let title = clean(jobTitleFallback[1]);
      title = title.replace(/^(?:experience|work\s+experience|employment)\s+/i, "").trim();
      if (title.length > 2) parsed.designation = title.slice(0, 80);
    }
  }

  // ── Current Company / Institution ──────────────────────────────────────────────
  const companyPatterns = [
    /(?:current\s+)?(?:company|organization|employer|organisation)\s*[:\-]\s*(.+)/i,
    /(?:currently\s+working\s+(?:at|with|in)|working\s+(?:at|with))\s+(.+?)(?:\n|,|since|from|$)/i,
    /(?:employed\s+(?:at|by|with))\s+(.+?)(?:\n|,|$)/i,
  ];
  for (const pat of companyPatterns) {
    const m = fullText.match(pat);
    if (m) {
      const val = clean(m[1]).split(/[\n|]/)[0].slice(0, 100);
      if (val.length > 2) { parsed.currentInstitutionOrCompany = val; break; }
    }
  }
  if (!parsed.currentInstitutionOrCompany) {
    const companyFallback = fullText.match(
      /\d{2}[.\-\/]\d{2}[.\-\/]\d{4}\s+to\s+(?:till\s+date|present|now|current)[^\n]*\n([A-Za-z][A-Za-z\s&.\-]{2,60})\n/i
    );
    if (companyFallback) {
      parsed.currentInstitutionOrCompany = clean(companyFallback[1]).slice(0, 100);
    }
  }

  // ── Field of Study ────────────────────────────────────────────────────────────
  const degreeSubjectPattern = /\b(?:M\.?Sc|B\.?Sc|M\.?Tech|B\.?Tech|M\.?A|B\.?A|M\.?Com|B\.?Com|M\.?C\.?A|B\.?C\.?A|M\.?E|B\.?E)\b\.?[ \t]*[:\-–—,.\(\)]*[ \t]*([A-Za-z][A-Za-z \t&—\-–\/]{2,50})/i;
  const degreeSubjectMatch = fullText.match(degreeSubjectPattern);
  if (degreeSubjectMatch) {
    const subject = clean(degreeSubjectMatch[1]).split(/[\n,]/)[0].slice(0, 80);
    if (subject.length > 2 && !/college|university|school|institute|city|district|tamil|karnataka|kerala/i.test(subject)) {
      parsed.fieldofStudy_Interest = subject;
    }
  }
  if (!parsed.fieldofStudy_Interest) {
    const studyPatterns = [
      /(?:field\s+of\s+study|branch|specialization|specialisation|major|stream)\s*[:\-]\s*(.+)/i,
      /(?:studied|studying|pursuing)\s+(.+?)(?:\n|at\b|in\b|from\b|,|$)/i,
    ];
    for (const pat of studyPatterns) {
      const m = fullText.match(pat);
      if (m) {
        const val = clean(m[1]).split(/[\n|]/)[0].slice(0, 80);
        if (val.length > 2) { parsed.fieldofStudy_Interest = val; break; }
      }
    }
  }

  // ── Skills ──────────────────────────────────────────────────────────────────────
  const skillsSectionPattern = /(?:technical\s+skills?|key\s+skills?|skills?)\s*[:\-]?\s*\n([\s\S]{10,600}?)(?:\n\s*\n|\n[A-Z][A-Za-z\s]{4,}[\n:])/i;
  const skillsMatch = fullText.match(skillsSectionPattern);
  if (skillsMatch) {
    const rawSkills = skillsMatch[1]
      .split(/[\n,•·|\\/]/)
      .map((s) => clean(s).replace(/^[-–•]\s*/, ""))
      .filter((s) => s.length >= 2 && s.length <= 50 && !/^\d+$/.test(s) && !/^(and|or|the|a|an|to|in|of)$/i.test(s));
    parsed.skills = [...new Set(rawSkills)].slice(0, 20);
  }

  // ── Gender ─────────────────────────────────────────────────────────────────────
  const genderMatch = fullText.match(/(?:gender|sex)\s*[:\-]?\s*(male|female|m|f)\b/i);
  if (genderMatch) {
    const g = genderMatch[1].toLowerCase();
    parsed.gender = (g === "male" || g === "m") ? "Male" : "Female";
  } else {
    const gFallback = fullText.match(/\b(male|female)\b/i);
    if (gFallback) parsed.gender = gFallback[1][0].toUpperCase() + gFallback[1].slice(1).toLowerCase();
  }

  // ── Languages ──────────────────────────────────────────────────────────────────
  const languagesSectionPattern = /(?:languages\s+(?:known|spoken)?|linguistic\s+skills?|languages)\s*[:\-]?\s*\n([\s\S]{5,400}?)(?:\n\s*\n|\n[A-Z][A-Za-z\s]{4,}[\n:])/i;
  const languagesMatch = fullText.match(languagesSectionPattern);
  const KNOWN_LANGUAGES = [
    "English", "Tamil", "Hindi", "Kannada", "Urdu", "Telugu", "Malayalam", "Marathi",
    "Bengali", "Gujarati", "Odia", "Punjabi", "Assamese", "Sanskrit", "French", "German",
    "Spanish", "Arabic"
  ];
  
  if (languagesMatch) {
    const sectionText = languagesMatch[1];
    const foundLanguages = [];
    for (const lang of KNOWN_LANGUAGES) {
      const escaped = lang.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pat = new RegExp(`\\b${escaped}\\b`, "i");
      if (pat.test(sectionText)) {
        foundLanguages.push(lang);
      }
    }
    parsed.languages = foundLanguages;
  } else {
    const langLineMatch = fullText.match(/(?:languages\s+(?:known|spoken)?|languages)\s*[:\-]\s*(.+)/i);
    if (langLineMatch) {
      const lineText = langLineMatch[1];
      const foundLanguages = [];
      for (const lang of KNOWN_LANGUAGES) {
        const escaped = lang.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pat = new RegExp(`\\b${escaped}\\b`, "i");
        if (pat.test(lineText)) {
          foundLanguages.push(lang);
        }
      }
      if (foundLanguages.length > 0) {
        parsed.languages = foundLanguages;
      }
    }
  }

  // ── Father's Name ─────────────────────────────────────────────────────────────
  const fatherMatch = fullText.match(/(?:father['’]s\s+name|father\s+name)\s*[:\-]\s*(.+)/i);
  if (fatherMatch) parsed.fatherName = clean(fatherMatch[1]).split(/[\n,]/)[0].slice(0, 80);

  // ── Mother's Name ─────────────────────────────────────────────────────────────
  const motherMatch = fullText.match(/(?:mother['’]s\s+name|mother\s+name)\s*[:\-]\s*(.+)/i);
  if (motherMatch) parsed.motherName = clean(motherMatch[1]).split(/[\n,]/)[0].slice(0, 80);

  // ── Date of Birth ─────────────────────────────────────────────────────────────
  const dobMatch = fullText.match(/(?:date\s+of\s+birth|dob|d\.o\.b)\s*[:\-]\s*(.+)/i);
  if (dobMatch) {
    const rawDob = clean(dobMatch[1]).split(/[\n,]/)[0];
    const standardDob = parseDateToYMD(rawDob);
    if (standardDob) {
      parsed.dateOfBirth = standardDob;
    } else {
      parsed.dateOfBirth = rawDob;
    }
  }

  // ── Marital Status ────────────────────────────────────────────────────────────
  const maritalMatch = fullText.match(/(?:marital\s+status|marital|status)\s*[:\-]\s*(single|married|unmarried|divorced)/i);
  if (maritalMatch) {
    const status = maritalMatch[1].toLowerCase();
    parsed.maritalStatus = status.charAt(0).toUpperCase() + status.slice(1);
  }

  // ── Hometown ──────────────────────────────────────────────────────────────────
  const hometownMatch = fullText.match(/(?:hometown|home\s+town)\s*[:\-]\s*(.+)/i);
  if (hometownMatch) parsed.hometown = clean(hometownMatch[1]).split(/[\n,]/)[0].slice(0, 80);

  // ── Pincode ───────────────────────────────────────────────────────────────────
  const pincodeMatch = fullText.match(/(?:pincode|pin\s+code|zip\s+code|zip)\s*[:\-]?\s*(\d{6})/i);
  if (pincodeMatch) parsed.pincode = pincodeMatch[1];

  // ── Address ───────────────────────────────────────────────────────────────────
  const addressMatch = fullText.match(/address\s*[:\-]\s*([\s\S]+?)(?:\n\s*\n|\n[A-Z][a-z]+|\n[A-Z\s]{4,}:|$)/i);
  if (addressMatch) {
    parsed.address = clean(addressMatch[1]).slice(0, 200);
  }

  // ── District ──────────────────────────────────────────────────────────────────
  const districtMatch = fullText.match(/district\s*[:\-]\s*(.+)/i);
  if (districtMatch) parsed.district = clean(districtMatch[1]).split(/[\n,]/)[0].slice(0, 80);

  // ── Preferred Location ────────────────────────────────────────────────────────
  const prefLocMatch = fullText.match(/(?:preferred\s+locations?|location\s+preferences?|preferred\s+job\s+locations?)\s*[:\-]\s*(.+)/i);
  if (prefLocMatch) {
    const rawLoc = clean(prefLocMatch[1]).split(/[\n]/)[0].slice(0, 100);
    parsed.careerProfile.location = rawLoc;
    if (!parsed.district) {
      const parts = rawLoc.split(/[,]/).map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) parsed.district = parts[0];
    }
  }

  // ── Preferred Job Roles ───────────────────────────────────────────────────────
  const prefRolesMatch = fullText.match(/(?:preferred\s+job\s+roles?|preferred\s+roles?|desired\s+roles?)\s*[:\-]\s*(.+)/i);
  if (prefRolesMatch) {
    const rawRoles = clean(prefRolesMatch[1]).split(/[\n]/)[0];
    const rolesArr = rawRoles.split(/[,/|]/).map(r => clean(r)).filter(Boolean);
    parsed.careerProfile.role = rolesArr;
  }

  // ── Preferred Industry ────────────────────────────────────────────────────────
  const prefIndMatch = fullText.match(/(?:preferred\s+industry|industry)\s*[:\-]\s*(.+)/i);
  if (prefIndMatch) {
    parsed.careerProfile.industry = clean(prefIndMatch[1]).split(/[\n,]/)[0].slice(0, 80);
  }

  // ── Employment Type ───────────────────────────────────────────────────────────
  const empTypeMatch = fullText.match(/(?:employment\s+type|job\s+type)\s*[:\-]\s*(.+)/i);
  if (empTypeMatch) {
    const rawType = clean(empTypeMatch[1]).toLowerCase();
    if (rawType.includes("full")) parsed.careerProfile.employmentType = "Full-time";
    else if (rawType.includes("part")) parsed.careerProfile.employmentType = "Part-time";
    else if (rawType.includes("free")) parsed.careerProfile.employmentType = "Freelance";
    else if (rawType.includes("intern")) parsed.careerProfile.employmentType = "Internship";
    else if (rawType.includes("remote")) parsed.careerProfile.employmentType = "Remote";
    else if (rawType.includes("contract")) parsed.careerProfile.employmentType = "Contract";
  }

  // ── Expected Salary ───────────────────────────────────────────────────────────
  const expSalaryMatch = fullText.match(/(?:expected\s+salary|salary|ctc|expected\s+ctc)\s*[:\-]\s*(.+)/i);
  if (expSalaryMatch) {
    const digitsOnly = clean(expSalaryMatch[1]).replace(/[^0-9]/g, "");
    if (digitsOnly) {
      parsed.careerProfile.expectedSalary = digitsOnly;
    }
  }

  // ── Notice Period ─────────────────────────────────────────────────────────────
  const noticeMatch = fullText.match(/(?:notice\s+period|notice)\s*[:\-]\s*(.+)/i);
  if (noticeMatch) {
    const rawNotice = clean(noticeMatch[1]).split(/[\n,]/)[0].slice(0, 50);
    parsed.careerProfile.noticePeriod = normalizeNoticePeriod(rawNotice);
  }

  // ── Certifications ────────────────────────────────────────────────────────────
  const certsSectionPattern = /(?:certifications|certificates|certification\s+details)\s*[:\-]?\s*\n([\s\S]{10,1200}?)(?=\n+(?:projects|education|languages|declaration|skills|summary|work\s+experience)\b|$)/i;
  const certsMatch = fullText.match(certsSectionPattern);
  if (certsMatch) {
    const sectionText = certsMatch[1];
    const lines = sectionText.split("\n").map(l => l.trim()).filter(Boolean);
    let currentCert = null;
    for (const line of lines) {
      const numMatch = line.match(/^(?:\d+[\.\)\-]\s*)?(.+?)(?:\s*\(([^)]+)\))?$/);
      if (numMatch && !line.startsWith("Description:")) {
        if (currentCert) {
          parsed.certifications.push(currentCert);
        }
        const name = numMatch[1].trim();
        const dateStr = numMatch[2] ? numMatch[2].trim() : "";
        currentCert = {
          name,
          certifiedDate: parseDateToYMD(dateStr) || dateStr || "",
          description: "",
        };
      } else if (line.startsWith("Description:") && currentCert) {
        currentCert.description = line.replace(/^Description:\s*/i, "").trim();
      } else if (currentCert) {
        currentCert.description = (currentCert.description + " " + line).trim();
      }
    }
    if (currentCert) {
      parsed.certifications.push(currentCert);
    }
  }

  // ── Experience Details ─────────────────────────────────────────────────────────
  const expDetails = [];
  const monthsStr = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december";
  const dateRegexPart = `(?:(?:\\d{1,2}[.\\-\\/])?\\b(?:\\d{1,2}|${monthsStr})\\b[.\\-\\/',\\s]*(?:\\d{4}|'\\d{2}|\\b\\d{2}\\b))`;
  const rangeRegex = new RegExp(
    `(${dateRegexPart})\\s*(?:-|–|—|to)\\s*(present|till\\s+date|now|current|till\\s+now|${dateRegexPart})`,
    "gi"
  );
  
  let expMatch;
  while ((expMatch = rangeRegex.exec(fullText)) !== null) {
    const matchIndex = expMatch.index;
    const startStr = expMatch[1];
    const endStr = expMatch[2];
    
    const startDate = parseDateToYMD(startStr);
    const endDate = parseDateToYMD(endStr);
    const isCurrentlyWorking = !endDate;

    // Find the full line containing the date range match
    const lineStart = fullText.lastIndexOf("\n", matchIndex) + 1;
    const lineEnd = fullText.indexOf("\n", matchIndex);
    const lineText = fullText.slice(lineStart, lineEnd !== -1 ? lineEnd : fullText.length).trim();
    
    // Remove the match string from the line
    const remainingLineText = lineText.replace(expMatch[0], "").replace(/^[|\s\-–—]+|[|\s\-–—]+$/g, "").trim();
    
    let designation = "";
    let companyName = "";
    
    if (remainingLineText.length > 5) {
      // Case 1: Designation and Company on the same line, e.g., split by pipe, comma, or separator
      const parts = remainingLineText.split(/\||,|\s+-\s+|\s+at\s+|\s+with\s+/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        designation = parts[0];
        companyName = parts[1];
      } else if (parts.length === 1) {
        designation = parts[0];
      }
    }
    
    // Case 2: Preceding lines check if designation or company name is missing
    if (!designation || !companyName) {
      const prevLinesText = fullText.slice(Math.max(0, lineStart - 150), lineStart);
      const prevLines = prevLinesText.split("\n").map(l => l.trim()).filter(Boolean);
      if (prevLines.length >= 2) {
        if (!designation) designation = prevLines[prevLines.length - 2];
        if (!companyName) companyName = prevLines[prevLines.length - 1];
      } else if (prevLines.length === 1) {
        if (!designation) designation = prevLines[0];
      }
    }
    
    designation = clean(designation).slice(0, 80);
    companyName = clean(companyName).slice(0, 100);
    
    // Extract description bullets after the date line
    const nextLinesText = fullText.slice(lineEnd !== -1 ? lineEnd : fullText.length, Math.min(fullText.length, (lineEnd !== -1 ? lineEnd : fullText.length) + 400));
    const nextLines = nextLinesText.split("\n").map(l => l.trim()).filter(Boolean);
    const bulletLines = [];
    for (const line of nextLines) {
      if (line.match(/^[\d\+\-\(\)\|\*#•·○■]/) || line.startsWith("Developed") || line.startsWith("Built") || line.startsWith("Managed") || line.startsWith("Collaborated") || line.startsWith("Designed") || line.startsWith("Created")) {
        bulletLines.push(line);
      } else {
        break;
      }
    }
    const description = bulletLines.join("\n");

    if (designation.length > 2 && companyName.length > 2 && 
        !designation.includes(":") && !companyName.includes(":") &&
        !/experience|resume|education/i.test(designation) &&
        !/experience|resume|education/i.test(companyName)) {
      expDetails.push({
        companyName,
        designation,
        startDate,
        endDate,
        currentlyWorking: isCurrentlyWorking,
        description: description,
      });
    }
  }

  if (expDetails.length > 0) {
    parsed.experienceDetails = expDetails;
  }
  console.log("[cvParser] Parsed:", JSON.stringify(parsed));
  return parsed;
}

// ── Main entry point ──────────────────────────────────────────────────────────
async function parseCv(buffer, mimetype) {
  console.log(`[cvParser] Parsing: mime=${mimetype}, size=${buffer.length}B`);

  let text = "";
  const isPdf  = mimetype === "application/pdf";
  const isDocx = mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isDoc  = mimetype === "application/msword";

  if (isPdf)                text = await extractPdfText(buffer);
  else if (isDocx || isDoc) text = await extractDocxText(buffer);
  else return { error: "Unsupported file type for parsing" };

  if (!text || text.trim().length < 10) {
    console.warn("[cvParser] No usable text extracted");
    return { error: "Could not extract text — file may be scanned/image-based", parsedData: {} };
  }

  const parsedData = parseFields(text, buffer);
  return { parsedData };
}

module.exports = { parseCv };
