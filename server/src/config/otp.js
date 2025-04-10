const otpStore = new Map(); 

const generateOTP = (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, expiresAt });
    
    console.log('Generated OTP for:', email, {
        otp,
        expiresAt: new Date(expiresAt).toISOString(),
        currentTime: new Date().toISOString(), 
        timeRemaining: `${Math.floor((expiresAt - Date.now())/1000)} seconds`
    });
    
    return otp;
};

const verifyOTP = (email, enteredOtp) => {
    const storedOtp = otpStore.get(email);
    
    if (!storedOtp) {
        console.error('OTP verification failed - no OTP found', {
            email,
            availableEmails: Array.from(otpStore.keys()),
            timestamp: new Date().toISOString()
        });
        return false;
    }
    
    if (storedOtp.expiresAt < Date.now()) {
        console.error('OTP expired for email:', email, 
                    'Expired at:', new Date(storedOtp.expiresAt).toISOString(),
                    'Current time:', new Date().toISOString());
        otpStore.delete(email);
        return false;
    }
    
    if (storedOtp.otp !== enteredOtp) {
        console.error('OTP verification failed - mismatch', {
            email,
            expected: storedOtp.otp,
            received: enteredOtp,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(storedOtp.expiresAt).toISOString()
        });
        return false;
    }
    
    otpStore.delete(email);
    console.log('OTP verified successfully for:', email, {
        timeUsed: `${Math.floor((Date.now() - storedOtp.expiresAt + (5*60*1000))/1000)} seconds`,
        currentTime: new Date().toISOString()
    });
    return true;
};

module.exports = { generateOTP, verifyOTP };
