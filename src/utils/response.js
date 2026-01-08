exports.success = (
  res,
  message = "Success",
  data = null,
  pageMetaData = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "OK",
    message,
    data,
    ...(pageMetaData && { pageMetaData }),
  });
};

exports.error = (
  res,
  message = "Something went wrong",
  statusCode = 400,
  errors = null
) => {
  return res.status(statusCode).json({
    status: "Fail",
    message,
    errors,
  });
};
