const { authService } = require("../../services/Users/auth.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    if (user) {
      return success(res, "User Found Successfully", user);
    }
  } catch (err) {
    return error(res, err.message, 400);
  }
};
