const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
    ip: { 
        type: String, 
        required: true, 
        unique: true,
        index: true // Add index for faster lookups
    },
    email: { 
        type: String, 
        required: true,
        index: true // Add index for faster lookups
    },
    reason: { 
        type: String, 
        default: "Disposable email used" 
    },
    blockedAt: { 
        type: Date, 
        default: Date.now,
        index: true // Add index for faster lookups
    },
    expiresAt: { 
        type: Date,
        default: null // null means never expires
    },
    isIPv6: { 
        type: Boolean, 
        default: false 
    },
    attempts: { 
        type: Number, 
        default: 1 
    },
    lastAttempt: { 
        type: Date, 
        default: Date.now 
    }
});

// Add a pre-save middleware to detect IPv6 addresses
blockedIPSchema.pre('save', function(next) {
    this.isIPv6 = this.ip.includes(':');
    next();
});

// Add a method to check if the block has expired
blockedIPSchema.methods.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
};

// Add a static method to find active blocks
blockedIPSchema.statics.findActive = function(ip) {
    return this.findOne({
        ip,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });
};

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
