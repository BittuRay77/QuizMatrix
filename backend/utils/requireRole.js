// Middleware to require a specific user role (or roles)
module.exports = function requireRole(required) {
  // required can be a string or array of strings
  const requiredRoles = Array.isArray(required) ? required : [required];

  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      if (!requiredRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Role check failed' });
    }
  };

  };

