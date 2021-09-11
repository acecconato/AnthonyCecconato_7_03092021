const hateoas = require('halson');

class Paginator {
  /**
   * Get limit and offset from page and size
   * @param page
   * @param size
   * @return {{offset: number, limit: number}}
   */
  getPagination(page, size) {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
  }

  getPagingData(datas, rows, url, page, limit) {
    const { count: totalItems } = datas;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    const _links = hateoas({})
      .addLink('next page', { method: 'GET', url: `${url}?page=${+page + 1}` });

    if (page > 0) {
      _links.addLink('previous page', { method: 'GET', url: `${url}?page=${+page - 1}` });
    }

    return {
      totalItems, totalPages, currentPage, rows, ..._links,
    };
  }
}

module.exports = new Paginator();
