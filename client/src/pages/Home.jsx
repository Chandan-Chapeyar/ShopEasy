import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products/categories').then(setCategories).catch(() => {});
  }, []);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page, sort, ...(query && { search: query }), ...(category !== 'All' && { category }) });
    api(`/products?${qs}`)
      .then((d) => { setProducts(d.products); setPages(d.pages); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, category, sort, page]);

  return (
    <>
      <section className="hero">
        <h1>Find something you'll love</h1>
        <p>Browse the catalog, add items to your cart and check out in minutes.</p>
      </section>

      <div className="toolbar">
        <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option>All</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading ? (
        <p className="center">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="center">No products found.</p>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}

      {pages > 1 && (
        <div className="pager">
          <button className="btn small ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btn small ghost" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
