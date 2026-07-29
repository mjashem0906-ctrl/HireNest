import { createContext, useContext, useEffect, useState } from 'react'
import API from '../axios'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const {user} = useAuth(); // get logged in user
  const [memberContext, setMemberContext] = useState([]);
  const [projectContext,setProjectContext] = useState([]);
  const [taskContext,setTaskContext] = useState([]);
  const [subTaskContext,setSubTaskContext] = useState([]);
  const [activityContext,setActivityContext] = useState([]);
  const [userContext,setUserContext] =useState('');
  const [allUserContext,setAllUserContext]= useState([]);
  const [placeContext,setPlaceContext] = useState([]);
  const [jobContext,setJobContext] = useState([]);
  
  useEffect(() => {
    if (user) { // ✅ Only fetch after login
      if(user?.role==="Admin"){
        fetchMemberData();
        fetchAllUserData();
        // fetchActivityData();
      }
      else if (user.role === "IT_Member") {
        fetchMemberData();
      }
      
      fetchProjectData();
      fetchTaskData();
      fetchSubTaskData();
      fetchUserData();
      fetchPlaceData();
      fetchJobData();
      

    } else {
      setProjectContext([]); // optional: clear data on logout
      setMemberContext([]);
      setTaskContext([]);
      setSubTaskContext([]);
      setUserContext("");
      setAllUserContext([]);
      setPlaceContext([]);
      setJobContext([]);
    }
   
  }, [user]); // ✅ rerun whenever login/logout happens


  // const fetchMemberDataById = async() =>{
  //   try {
  //     // const res = await API.get(`/member/${user.memberId}`)
  //     // const sorted = res.data.sort((a, b) => a.memberReferenceNumber - b.memberReferenceNumber)
  //     // setMemberContext(sorted);
  //    console.log(user.memberId);
  
  //   } catch (err) {
  //     console.error('Failed to load members:', err)
  //   }
  // }
  const fetchJobData = async()=>{
    try {
           const res=  await API.get("/service");
           const sorted = res.data.data;
           setJobContext(sorted); 
    }
        catch (error) {
            console.error("Error fetching Jobs in Data Context:", error);
            }           
  }
  const fetchMemberData = async () => {
    try {
      const res = await API.get('/member')
      const sorted = res.data.sort((a, b) => (Number(a.memberReferenceNumber) || 0) - (Number(b.memberReferenceNumber) || 0))
      setMemberContext(sorted);
     console.log(sorted);
  
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }
  const fetchUserData = async ()=>{
    if(user.role==="Member"){ 
    try {
      const res = await API.get(`/member/${user.memberId}`)
        setUserContext(res.data);
        console.log(res.data);
      
    } catch (err) {
      console.error('Failed to load members:', err)
    }
      }
  }
  const fetchAllUserData = async()=>{
    try{
      const res = await API.get(`/auth/getUser`);
      setAllUserContext(res.data);
      
    }catch(error){
      console.error('Failed to Load user data:',error);
    }
  }
  const fetchProjectData = async()=>{
    try{
      const res = await API.get('/project');
      const sorted = res.data.sort((a,b)=> a.customId-b.customId);
      setProjectContext(sorted);
     
    }catch(error){
      console.error("Failed to load projects in Data Context:",error);
    }
  }

  const fetchTaskData = async()=>{
    try {
            const res= await API.get("/task");
            const sorted = res.data.data.sort((a,b)=>a.customId-b.customId);
            setTaskContext(sorted);
           
            }
        catch (error) {
            console.error("Error fetching Tasks in Data Context:", error);
            }

  }
  const fetchSubTaskData = async()=>{

    try {
           const res=  await API.get("/subTask");
           const sorted = res.data.data.sort((a,b)=>a.customId - b.customId)
           setSubTaskContext(sorted);
          
           
            }
        catch (error) {
            console.error("Error fetching SubTasks in Data Context:", error);
            }
  }

  const fetchPlaceData  = async()=>{
    try {
           const res=  await API.get("/place");
           const sorted = res.data;
           setPlaceContext(sorted);
   
            }
        catch (error) {
            console.error("Error fetching Places in Data Context:", error);
            }

  }

  // const fetchActivityData =async()=>{
  //      try{
  //         const res = await API.get("/activityList/dashboard");
  //         setActivityList(res.data);
  //         console.log("Fetching ActivityList data:",res.data.length)
  //       }
  //       catch(error){
  //         console.error("Error fetching ActivityList:", error);
  //       }
  // }
  return (
    <DataContext.Provider value={{
       memberContext, projectContext,taskContext,subTaskContext,activityContext,userContext,allUserContext,placeContext,
       jobContext,setJobContext,setPlaceContext,setMemberContext,setProjectContext,setTaskContext,setSubTaskContext,
       setActivityContext,setUserContext,setAllUserContext}}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
