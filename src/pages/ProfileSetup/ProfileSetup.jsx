import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../axios";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/UI/FormInput";
import DropdownSelect from "../../components/UI/DropdownSelect";
import DateSelect from "../../components/UI/DateSelect";
import styles from "./ProfileSetup.module.scss";

const ProfileSetup = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        mobileNumber: "",
        gender: "",
        dateOfBirth: null,
        currentInstitutionOrCompany: "",
        designation: "",
        fieldofStudy_Interest: "",
        workExp: "",
        highest_education: "",
        preferredJobRole_Sector: ""
    });
    const [loading, setLoading] = useState(false);

    const calculateCompletion = () => {
        if (!role) return 0;
        const mentorFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'currentInstitutionOrCompany', 'designation', 'fieldofStudy_Interest', 'workExp'];
        const jobFields = ['name', 'mobileNumber', 'gender', 'dateOfBirth', 'highest_education', 'fieldofStudy_Interest', 'preferredJobRole_Sector', 'workExp'];

        const fieldsToTrack = role === 'Mentor' ? mentorFields : jobFields;
        const completedFields = fieldsToTrack.filter(field => formData[field] && String(formData[field]).length > 0);
        return Math.round((completedFields.length / fieldsToTrack.length) * 100);
    };

    const completion = calculateCompletion();

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await API.post("/auth/update-profile", {
                role,
                profileData: formData
            });
            login(res.data.user);
            if (res.data.user.profileCompleted === 100) {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h1>Complete Your Profile</h1>
                <p>Please provide your details to continue</p>

                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${completion}%` }}
                        ></div>
                    </div>
                    <span>{completion}% Complete</span>
                </div>

                {!role ? (
                    <div className={styles.roleSelection}>
                        <h3>What is your role?</h3>
                        <div className={styles.roleButtons}>
                            <button onClick={() => setRole("Mentor")}>Mentor</button>
                            <button onClick={() => setRole("Job")}>Job Seeker</button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.form}>
                        <button className={styles.backBtn} onClick={() => setRole("")}>Change Role</button>

                        <div className={styles.formGrid}>
                            <FormInput
                                label="Full Name"
                                value={formData.name}
                                onChange={(v) => setFormData({ ...formData, name: v })}
                            />
                            <FormInput
                                label="Mobile Number"
                                value={formData.mobileNumber}
                                onChange={(v) => setFormData({ ...formData, mobileNumber: v })}
                            />
                            <DropdownSelect
                                label="Gender"
                                value={formData.gender}
                                options={[
                                    { value: "Male", label: "Male" },
                                    { value: "Female", label: "Female" },
                                    { value: "Other", label: "Other" },
                                ]}
                                onChange={(v) => setFormData({ ...formData, gender: v })}
                            />
                            <DateSelect
                                label="Date of Birth"
                                value={formData.dateOfBirth}
                                onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                            />

                            {role === 'Mentor' ? (
                                <>
                                    <FormInput
                                        label="Current Company / Institution"
                                        value={formData.currentInstitutionOrCompany}
                                        onChange={(v) => setFormData({ ...formData, currentInstitutionOrCompany: v })}
                                    />
                                    <FormInput
                                        label="Designation"
                                        value={formData.designation}
                                        onChange={(v) => setFormData({ ...formData, designation: v })}
                                    />
                                </>
                            ) : (
                                <>
                                    <FormInput
                                        label="Highest Education"
                                        value={formData.highest_education}
                                        onChange={(v) => setFormData({ ...formData, highest_education: v })}
                                    />
                                    <FormInput
                                        label="Preferred Job Role"
                                        value={formData.preferredJobRole_Sector}
                                        onChange={(v) => setFormData({ ...formData, preferredJobRole_Sector: v })}
                                    />
                                </>
                            )}

                            <FormInput
                                label="Field of Interest / Study"
                                value={formData.fieldofStudy_Interest}
                                onChange={(v) => setFormData({ ...formData, fieldofStudy_Interest: v })}
                            />
                            <FormInput
                                label="Years of Experience"
                                value={formData.workExp}
                                onChange={(v) => setFormData({ ...formData, workExp: v })}
                            />
                        </div>

                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save & Continue"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSetup;
