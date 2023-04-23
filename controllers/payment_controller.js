const { catchAsyncError } = require("../middlewares/catchAsyncError.js");
const { instance } = require("../server.js");
const { crypto } = require("crypto");
const { Payment } = require("../models/Payment.js");

const buySubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (user.role === "admin") {
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

const verifyPayment = catchAsyncError(async (req, res, next) => {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    const user = await User.findById(req.user._id);

    const subscription_id = user.subscription.id;

    const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(razorpay_payment_id + '|' + subscription_id, "utf-8").digest("hex");

    const isAuthentic = generated_signature === razorpay_signature;

    if (!isAuthentic) {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
    }

    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    });

    user.subscription.status = "active";

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/payment/success?reference=${razorpay_payment_id}`);
});

const getRazorpayKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        razorpayKey: process.env.RAZORPAY_KEY,
    });
});

const cancelSubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const subscription_id = user.subscription.id;
    let refund = false; 
    await instance.subscriptions.cancel(subscription_id);
    const payment = await Payment.findOne({ razorpay_subscription_id: subscription_id });

    const gap = Date.now() - payment.createdAt;
    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if(refundTime > gap){
        await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;
    }

    await payment.remove();
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: refund ? "Subscription cancelled, You will receive refund within 7 days.": "No refund initiated as subscription was cancelled after 7 days.",
    });

});


module.exports = { buySubscription, verifyPayment, getRazorpayKey, cancelSubscription};