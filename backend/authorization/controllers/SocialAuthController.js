const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserModel = require("../../common/models/User");
const { jwtSecret, jwtExpirationInSeconds, roles } = require("../../config");

const generateAccessToken = (username, userId) => {
  return jwt.sign({ userId, username }, jwtSecret, {
    expiresIn: jwtExpirationInSeconds,
  });
};

const buildSafeUser = (user) => {
  const { password: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...safeUser } = user.toJSON();
  return safeUser;
};

module.exports = {
  /**
   * POST /auth/google
   * Body: { idToken, user: { email, firstName, lastName, username } }
   * In production, verify idToken with google-auth-library.
   * For this app, we trust the client-sent payload (dev mode).
   */
  googleLogin: async (req, res) => {
    try {
      const { idToken, user: googleUser } = req.body;

      if (!idToken || !googleUser || !googleUser.email) {
        return res.status(400).json({
          status: false,
          error: { message: "idToken and user.email are required." },
        });
      }

      // Find by googleId (idToken used as identifier in dev) or email
      let user = await UserModel.findUser({ email: googleUser.email });

      if (user) {
        // Link Google account if not already linked
        if (!user.googleId) {
          await UserModel.updateUser(
            { id: user.id },
            { googleId: googleUser.id || idToken.substring(0, 64) }
          );
        }
      } else {
        // Create new user from Google profile
        user = await UserModel.createUser({
          username: googleUser.username || googleUser.email.split("@")[0],
          email: googleUser.email,
          firstName: googleUser.firstName || googleUser.givenName || "User",
          lastName: googleUser.lastName || googleUser.familyName || "",
          age: 0,
          role: roles.USER,
          googleId: googleUser.id || idToken.substring(0, 64),
          password: null,
        });
      }

      const accessToken = generateAccessToken(user.username, user.id);
      return res.status(200).json({
        status: true,
        data: { user: buildSafeUser(user), token: accessToken },
      });
    } catch (err) {
      return res.status(500).json({ status: false, error: err });
    }
  },

  /**
   * POST /auth/facebook
   * Body: { accessToken, user: { email, firstName, lastName, username } }
   */
  facebookLogin: async (req, res) => {
    try {
      const { accessToken, user: fbUser } = req.body;

      if (!accessToken || !fbUser || !fbUser.email) {
        return res.status(400).json({
          status: false,
          error: { message: "accessToken and user.email are required." },
        });
      }

      let user = await UserModel.findUser({ email: fbUser.email });

      if (user) {
        if (!user.facebookId) {
          await UserModel.updateUser(
            { id: user.id },
            { facebookId: fbUser.id || accessToken.substring(0, 64) }
          );
        }
      } else {
        user = await UserModel.createUser({
          username: fbUser.username || fbUser.email.split("@")[0],
          email: fbUser.email,
          firstName: fbUser.firstName || "User",
          lastName: fbUser.lastName || "",
          age: 0,
          role: roles.USER,
          facebookId: fbUser.id || accessToken.substring(0, 64),
          password: null,
        });
      }

      const accessTokenJwt = generateAccessToken(user.username, user.id);
      return res.status(200).json({
        status: true,
        data: { user: buildSafeUser(user), token: accessTokenJwt },
      });
    } catch (err) {
      return res.status(500).json({ status: false, error: err });
    }
  },

  /**
   * POST /auth/forgot-password
   * Body: { email }
   * Generates a reset token and logs it (no real email in dev).
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: false,
          error: { message: "Email is required." },
        });
      }

      const user = await UserModel.findUser({ email });

      if (!user) {
        // Don't reveal if email exists or not
        return res.status(200).json({
          status: true,
          data: { message: "If this email exists, a reset link has been sent." },
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await UserModel.updateUser(
        { id: user.id },
        { resetToken, resetTokenExpiry }
      );

      // In production, send email. For dev, log to console.
      console.log(`[Password Reset] Token for ${email}: ${resetToken}`);

      return res.status(200).json({
        status: true,
        data: { message: "If this email exists, a reset link has been sent." },
      });
    } catch (err) {
      return res.status(500).json({ status: false, error: err });
    }
  },

  /**
   * POST /auth/reset-password
   * Body: { resetToken, newPassword }
   */
  resetPassword: async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !newPassword) {
        return res.status(400).json({
          status: false,
          error: { message: "resetToken and newPassword are required." },
        });
      }

      const user = await UserModel.findUser({ resetToken });

      if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return res.status(400).json({
          status: false,
          error: { message: "Invalid or expired reset token." },
        });
      }

      const hash = crypto.createHash("sha256");
      hash.update(newPassword);
      const encryptedPassword = hash.digest("hex");

      await UserModel.updateUser(
        { id: user.id },
        { password: encryptedPassword, resetToken: null, resetTokenExpiry: null }
      );

      return res.status(200).json({
        status: true,
        data: { message: "Password has been reset successfully." },
      });
    } catch (err) {
      return res.status(500).json({ status: false, error: err });
    }
  },
};
