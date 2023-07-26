const getOffset = (limit = 10, page = 1) => (page - 1) * limit

const getPagination = (limit = 10, page = 1, total = 50) => {
  //總共要拆成幾頁,無條件進位
  const totalPage = Math.ceil(total / limit)
  //pages數量的陣列
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
  //page不能<1,也不能大於總頁數
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1
  return {
    pages,
    totalPage,
    currentPage,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}