import React, { useEffect, useState } from 'react'
import styles from '../../../components/Models/AddModel.module.scss';
import FormInput from '../../../components/UI/FormInput';
import { Upload, X } from 'lucide-react';
import API from '../../../axios';
import { useAuth } from '../../../context/AuthContext';

function ProvidedForm( {isOpen, onClose, onSubmit}) {

  const [form, setForm] = useState({
    title:"",
    description:"",
    memberId:null,
    type:"",
  });
  const [image, setImage] = useState(null);
   const [errors, setErrors] = useState({});
     const [btnLoading, setBtnLoading] = useState(false);
      const [selectedFileName, setSelectedFileName] = useState("");
      const {user} = useAuth();

     useEffect(() => {
     
          setForm({
            title:"",
            description:"",
            memberId:null,
            type:"",          
          });
      }, []);
      const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   
   const handleSubmit = async (e) => {
         e.preventDefault();
         if(btnLoading){
        return
      }
            if (validateForm()) {
              setBtnLoading(true);
              try {
                    
                    const res = await API.post("/jobs", form);

                    console.log(res.data);



              onSubmit(res.data.data);
              setForm({ title: "", description: "", image: "", memberId: null, type: "" });
              setSelectedFileName("");
              setErrors({});
              onClose();
            } catch (err) {
              console.error("Error:", err);
            } finally {
              setBtnLoading(false);
            }
          }
        };

    

        const handleCancel = () => {
            setForm({
              title:"",
              description:"",
              image:"",
              memberId:null,
              type:"",  
          
            });
            setErrors({});
            setSelectedFileName("");
            onClose();
  };
  if (!isOpen) return null;
  return (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      
      <div className={styles.header}>
        <h2>Post new job</h2>
        <button onClick={handleCancel} className={styles.closeButton}>
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <FormInput
          label="Title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
          placeholder="Enter job title"
          required
          error={errors.title}
          />

          <FormInput
          label="Description"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
          placeholder="Enter job description"
          multiline
          />     

          {/* <div className={styles.fileUploadWrapper}>
              <label className={styles.fileLabel}>
                <Upload size={16} /> {selectedFileName || "Choose an image"}
                <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className={styles.fileInput}
              />
              </label>
            </div>              */}
        </div>                        
                                        
        <div className={styles.actions}>
          <button type="button" onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" disabled={btnLoading} className={styles.submitButton}>
            {btnLoading? "Uploading" :  'Add Post'}
          </button>
        </div>    
      </form>
    </div>  
  </div>
  )
}

export default ProvidedForm
