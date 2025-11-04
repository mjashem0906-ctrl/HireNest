const StatusChangeRequest = require("../models/StatusChangeRequest");

// POST /status-request
const statusUpdatedByMember= async (req, res) => {
  const { subTaskId, requestedStatus,requestedBy } = req.body;
  // const userId = req.user.id; // from auth middleware

  const request = new StatusChangeRequest({
    subTaskId,
    requestedStatus,
    requestedBy,
    status: 'pending',
  });

  await request.save();
  res.json({ message: 'Request submitted' });
}
//Get all pending requests (Admin only)
const getStatusRequest = async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });

  const requests = await StatusChangeRequest.find({ status: 'pending' })
    .populate('subTaskId')
    .populate('requestedBy',"name email photoUrl");

  res.json(requests);
}

//Approve or reject a request

const statusApproved= async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });

  const { action } = req.body; // 'approve' or 'reject'
  const request = await StatusChangeRequest.findById(req.params.id).populate('subTaskId');

  if (!request) return res.status(404).json({ message: 'Request not found' });

  if (action === 'approve') {
    request.status = 'approved';
    request.subTaskId.status = request.requestedStatus;
    await request.subTaskId.save();
  } else if (action === 'reject') {
    request.status = 'rejected';
  }

  await request.save();
  res.json({ message: `Request ${action}d successfully` });
}

const getStatusCount = async(req,res)=>{
  if (req.user.role !== 'Member') return res.status(403).json({ message: 'Forbidden' });

  const requests = await StatusChangeRequest.find({
    // requestedBy: req.user.id,
    status: { $in: ['approved', 'rejected'] },
    // seen: false, // Add a `seen` flag to avoid duplicates
  }).populate('subTaskId');

  res.json(requests);
}

module.exports={statusUpdatedByMember,getStatusRequest,statusApproved,getStatusCount}