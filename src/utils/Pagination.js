const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getPageMetaData = (page, limit, totalItems) => {
  const totalPage = Math.ceil(totalItems / limit);
  return {
    totalPage,
    currentPage: page,
    totalItems: totalItems,
    pageSize: limit,
    hasnextPage: page < totalPage,
    hasPrevPage: page > 1,
  };
};
module.exports = { getPagination, getPageMetaData };
