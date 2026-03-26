const UserModel = require("./../../common/models/User");

module.exports = {
  getUser: (req, res) => {
    const {
      user: { userId },
    } = req;

    UserModel.findUser({ id: userId })
      .then((user) => {
        const { password: _pw, ...safeUser } = user.toJSON();
        return res.status(200).json({
          status: true,
          data: safeUser,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  updateUser: (req, res) => {
    const {
      user: { userId },
      body: payload,
    } = req;

    // IF the payload does not have any keys,
    // THEN we can return an error, as nothing can be updated
    if (!Object.keys(payload).length) {
      return res.status(400).json({
        status: false,
        error: {
          message: "Body is empty, hence can not update the user.",
        },
      });
    }

    // LWW conflict resolution: if client sends updatedAt, compare with server
    const { updatedAt: clientUpdatedAt, ...updateFields } = payload;

    const doUpdate = () => {
      return UserModel.updateUser({ id: userId }, updateFields)
        .then(() => UserModel.findUser({ id: userId }))
        .then((user) => {
          const { password: _pw, ...safeUser } = user.toJSON();
          return res.status(200).json({
            status: true,
            data: safeUser,
          });
        });
    };

    if (clientUpdatedAt) {
      UserModel.findUser({ id: userId })
        .then((user) => {
          const serverUpdatedAt = user.updatedAt
            ? new Date(user.updatedAt).getTime()
            : 0;
          if (clientUpdatedAt < serverUpdatedAt) {
            // Server has newer data — return server version (LWW: server wins)
            const { password: _pw, ...safeUser } = user.toJSON();
            return res.status(409).json({
              status: false,
              error: { message: "Server has newer data" },
              data: safeUser,
            });
          }
          return doUpdate();
        })
        .catch((err) => {
          return res.status(500).json({ status: false, error: err });
        });
    } else {
      doUpdate().catch((err) => {
        return res.status(500).json({ status: false, error: err });
      });
    }
  },

  deleteUser: (req, res) => {
    const {
      params: { userId },
    } = req;

    UserModel.deleteUser({ id: userId })
      .then((numberOfEntriesDeleted) => {
        return res.status(200).json({
          status: true,
          data: {
            numberOfUsersDeleted: numberOfEntriesDeleted,
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  getAllUsers: (req, res) => {
    UserModel.findAllUsers(req.query)
      .then((users) => {
        const safeUsers = users.map(
          ({ dataValues: { password: _pw, ...rest } }) => rest,
        );
        return res.status(200).json({
          status: true,
          data: safeUsers,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  changeRole: (req, res) => {
    const {
      params: { userId },
      body: { role },
    } = req;

    UserModel.updateUser({ id: userId }, { role })
      .then(() => {
        return UserModel.findUser({ id: userId });
      })
      .then((user) => {
        const { password: _pw, ...safeUser } = user.toJSON();
        return res.status(200).json({
          status: true,
          data: safeUser,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
