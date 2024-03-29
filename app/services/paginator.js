const hateoas = require('halson');

class Paginator {
  /**
   * Get limit and offset from page and size
   * @param page
   * @param size
   * @return {{offset: number, limit: number}}
   */
  getPagination(page, size) {
    let limit = size ? +size : process.env.ITEMS_PER_PAGE;
    const offset = page ? page * limit : 0;

    if (+size > +process.env.ITEMS_PER_PAGE) {
      limit = 3;
    }

    return { limit: parseInt(limit), offset: parseInt(offset) };
  }

  /**
   * Get paging datas
   * @param datas
   * @param rows
   * @param url
   * @param page
   * @param limit
   * @return {{totalItems, totalPages: number, currentPage: number, rows}}
   */
  getPagingData(datas, rows, url, page, limit) {
    const { count: totalItems } = datas;
    const currentPage = page ? +page : 0;
    let totalPages = Math.ceil(totalItems / limit) - 1;

    if (totalPages < 0) {
      totalPages = 0;
    }

    const _links = hateoas({})
      .addLink('next page', { method: 'GET', url: `${url}?page=${+currentPage + 1}` });

    if (currentPage > 0) {
      _links.addLink('previous page', { method: 'GET', url: `${url}?page=${+currentPage - 1}` });
    }

    return {
      totalItems, totalPages, currentPage, rows, ..._links,
    };
  }
}

module.exports = new Paginator();
