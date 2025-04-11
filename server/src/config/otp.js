const otpStore = new Map();

const generateOTP = (email, accountType = 'user') => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { 
        otp, 
        expiresAt,
        accountType,
        attempts: 0,
        lastAttempt: null
    });
    
    console.log('Generated OTP for:', email, {
        otp,
        expiresAt: new Date(expiresAt).toISOString(),
        currentTime: new Date().toISOString(), 
        timeRemaining: `${Math.floor((expiresAt - Date.now())/1000)} seconds`
    });
    
    return otp;
};

const verifyOTP = (email, enteredOtp, accountType = 'user') => {
    // Validate OTP format first
    if (!enteredOtp || !/^\d{6}$/.test(enteredOtp)) {
        return {
            valid: false,
            reason: 'invalid_format',
            remainingAttempts: 3
        };
    }

    const storedOtp = otpStore.get(email);
    
    if (!storedOtp) {
        return {
            valid: false,
            reason: 'not_found',
            remainingAttempts: 0
        };
    }
    
    // Check if OTP matches account type
    if (storedOtp.accountType !== accountType) {
        return {
            valid: false,
            reason: 'account_type_mismatch',
            expectedType: storedOtp.accountType,
            receivedType: accountType
        };
    }
    
    // Track attempts
    storedOtp.attempts++;
    storedOtp.lastAttempt = new Date().toISOString();
    
    if (storedOtp.expiresAt < Date.now()) {
        otpStore.delete(email);
        return {
            valid: false,
            reason: 'expired',
            remainingAttempts: 0
        };
    }
    
    if (storedOtp.otp !== enteredOtp) {
        const remainingAttempts = Math.max(0, 3 - storedOtp.attempts);
        if (remainingAttempts <= 0) {
            otpStore.delete(email);
        }
        return {
            valid: false,
            reason: 'mismatch',
            remainingAttempts
        };
    }
    
    otpStore.delete(email);
    console.log('OTP verified successfully for:', email, {
        timeUsed: `${Math.floor((Date.now() - storedOtp.expiresAt + (5*60*1000))/1000)} seconds`,
        currentTime: new Date().toISOString()
    });
    return {
        valid: true,
        reason: 'verified'
    };
};

module.exports = { generateOTP, verifyOTP };
