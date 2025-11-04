const Activity = require("../models/activity");
const Project = require("../models/project");

/**********Get All Projects */
const getProjectList=async(req,res)=>{
    const projectList=await Project.find()
    return res.json(projectList)
}
/*********Get Project by Id */
const getProject=async(req,res)=>{
    const project=await Project.findById(req.params.id)
    res.json(project)
}

// Helper to format ID like P00001
const generateCustomId = async () => {
  const lastProject = await Project.findOne({ customId: { $exists: true } })
    .sort({ createdAt: -1 }) // newest project first
    .select("customId");

  let newNumber = 1;
  if (lastProject && lastProject.customId) {
    const lastNumber = parseInt(lastProject.customId.replace("P", ""));
    newNumber = lastNumber + 1;
  }

  return `P${newNumber.toString().padStart(5, "0")}`;
};


/*********Add New Project */
const addProject = async(req,res)=>{
    try{
        const {title,description,startDate, endDate,priority,status}=req.body;
        if(!title){
            return res.status(400).json({message:"Project title is required"});
        }
        const customId = await generateCustomId();
        const newProject = await Project.create({customId,title,description,startDate, endDate,priority,status});

        await Activity.create({
            type: 'PROJECT',
            action: 'created',
            meta: {
              title, // project title
            },
            targetId: newProject._id,
          });

        res.status(201).json({message:"Project added successfully",project:newProject,});
        }catch(err){
            console.error("Error adding Project:",err);
            res.status(500).json({message:"Server Error",error:err.message});
        }
    }

/*********Update Project */
const editProject=async(req,res)=>{
    const {title,description,startDate, endDate,priority,status}=req.body 
    try{
  
           const updated= await Project.findByIdAndUpdate(req.params.id,{title,description,startDate, endDate,priority,status},{new:true})
            res.status(201).json({message:"Project updated successfully",project:updated,});
        }
    
    catch(err){
        return res.status(404).json({message:err})
    }
    
}

/*********Delete Project */
const deleteProject=async (req, res) => {
  try {
   
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
       
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
   
    res.status(400).json({ message: "Invalid project ID", error });
  }
}



module.exports={addProject,getProject,getProjectList,deleteProject,editProject}