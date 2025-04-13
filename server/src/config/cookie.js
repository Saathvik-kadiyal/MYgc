const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to false for development
    sameSite: 'none', // Set to none for development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

module.exports = cookieOptions; 