const otpStore = new Map(); 

const generateOTP = (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Expire in 5 mins
    return otp;
};

const verifyOTP = (email, enteredOtp) => {
    const storedOtp = otpStore.get(email);
    if (!storedOtp || storedOtp.expiresAt < Date.now() || storedOtp.otp !== enteredOtp) {
        return false;
    }
    otpStore.delete(email);
    return true;
};

module.exports = { generateOTP, verifyOTP };
