/**
 * Trả về options phân trang dùng chung
 * @param {Object} queryParams req.query
 * @returns {Object} { page, limit, skip }
 */
function getPagination(queryParams) {
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;

    let page = parseInt(queryParams.page, 10);
    let limit = parseInt(queryParams.limit, 10);

    if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = DEFAULT_LIMIT; // giới hạn max 100

    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Trả về object data phân trang chuẩn cho response
 * @param {Array} data Dữ liệu items sau truy vấn
 * @param {Number} total Tổng số item
 * @param {Number} page Trang hiện tại
 * @param {Number} limit Số item mỗi trang
 */
function getPagingData(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        totalItems: total,
        totalPages,
        currentPage: page,
        items: data,
    };
}

module.exports = {
    getPagination,
    getPagingData,
};
