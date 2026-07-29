const StatusChangeRequest = require("../models/StatusChangeRequest");
const { triggerNotification } = require("../utils/notificationHelper");
const Member = require("../models/member");

// POST /status-request
const statusUpdatedByMember = async (req, res) => {
  const { subTaskId, requestedStatus, requestedBy } = req.body;

  const request = new StatusChangeRequest({
    subTaskId,
    requestedStatus,
    requestedBy,
    status: 'pending',
  });

  await request.save();

  // --- NOTIFICATIONS WORKFLOW TRIGGER ---
  try {
    const member = await Member.findById(requestedBy);
    await triggerNotification({
      type: "pending_action",
      recipientId: null, // Broadcast to Admin
      title: "Pending Action: Status Change Request",
      message: `Member "${member ? member.name : "A member"}" has requested a status update to "${requestedStatus}".`,
      relatedId: request._id,
      relatedModel: "StatusChangeRequest"
    });
  } catch (notificationError) {
    console.error("Failed to trigger pending action notification:", notificationError);
  }

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

  // --- NOTIFICATIONS WORKFLOW TRIGGER ---
  try {
    const LoginUser = require("../models/login");
    const GoogleUser = require("../models/googleUser");
    const user = (await LoginUser.findOne({ memberId: request.requestedBy })) || (await GoogleUser.findOne({ memberId: request.requestedBy }));
    
    if (user) {
      await triggerNotification({
        type: "system_notification",
        recipientId: user._id,
        title: `Status Request ${action === "approve" ? "Approved" : "Rejected"}`,
        message: `Your status change request to "${request.requestedStatus}" has been ${action === "approve" ? "approved" : "rejected"} by the Admin.`,
        relatedId: request.subTaskId?._id,
        relatedModel: "SubTask"
      });
    }
  } catch (notificationError) {
    console.error("Failed to trigger status request approval notification:", notificationError);
  }

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