const { catchAsyncError } = require("../middlewares/catchAsyncError.js");
const {instance} = require("../server.js");

const buySubscription = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);

   if(user.role === "admin"){
         return next(new ErrorHandler("Admin cannot buy subscription", 400));
   }

   const plainID = process.env.PLAIN_ID;

   const subscription = await instance.subscriptions.create({
        plan: plainID,
        customer_notify: 1,
        total_count: 12,
   });

   user.subscription.id = subscription.id;
   user.subscription.status = subscription.status;

   await user.save();

   res.status(200).json({
        "success": true,
        subscriptionId: subscription.id,
   });
});

module.exports = {buySubscription};