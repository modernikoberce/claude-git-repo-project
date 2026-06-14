import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  imgUrl: string;
  brand: string;
  category: string;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">modernikoberce.cz</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Hledat koberce..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchProducts()}
            className="flex-1 border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchProducts}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
          >
            Hledat
          </button>
        </div>

        {loading && <p className="text-center text-gray-500">Načítám...</p>}

        {products.length === 0 && !loading && (
          <p className="text-center text-gray-500">Žádné produkty. Nejprve importuj feed.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition">
              {p.imgUrl && <img src={p.imgUrl} alt={p.name} className="w-full h-48 object-cover" />}
              <div className="p-3">
                <p className="text-sm text-gray-500">{p.brand}</p>
                <h3 className="font-medium text-gray-900 text-sm mt-1 line-clamp-2">{p.name}</h3>
                <p className="text-blue-600 font-bold mt-2">{p.price} Kč</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}