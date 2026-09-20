const BASE_STORE_URL = process.env.STORE_BASE_URL || 'https://demo.inelabteamdev.com';

// Curated high quality luxury product images for catalog demonstration
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80'
];

async function searchStoreCatalog(query = '', page = 1) {
  try {
    const res = await fetch(`${BASE_STORE_URL}/api/catalog?page=${page}&pageSize=50`);
    if (!res.ok) throw new Error(`Catalog API status ${res.status}`);
    const data = await res.json();
    
    let items = data.items || data.products || data.catalog || [];

    // Map items to standard format with rich images
    let mapped = items.map((item, index) => {
      const id = String(item.id || item.productId || `p-${index + 1}`);
      const title = item.title || item.name || `Luxury Item ${id}`;
      const brand = item.brand || item.seller || 'INE Luxe';
      const category = item.category || 'Audio & Wearables';
      const sku = item.sku || `SKU-${id}`;
      const image_url = item.imageUrl || item.image || SAMPLE_IMAGES[index % SAMPLE_IMAGES.length];
      const description = item.description || item.summary || 'Premium craft precision product from INE hosted mock store.';

      return {
        product_id: id,
        title,
        brand,
        category,
        sku,
        image_url,
        description,
        url: `${BASE_STORE_URL}/product/${id}`
      };
    });

    // Filter by query if provided
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      mapped = mapped.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.brand.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      total: mapped.length,
      items: mapped
    };

  } catch (err) {
    console.warn('Store Catalog Fetch Error:', err.message);
    
    // Fallback Mock Catalog if INE catalog endpoint is unreachable
    const fallbackCatalog = [
      { product_id: 'p-1', title: 'Acoustic SoundPro Headset', brand: 'Acoustic Labs', category: 'Audio', sku: 'ACO-901', image_url: SAMPLE_IMAGES[0], description: 'High fidelity wireless acoustic headphones.' },
      { product_id: '648', title: 'Helix Receiver S', brand: 'Bright Harbour', category: 'Audio', sku: 'HEL-10648', image_url: SAMPLE_IMAGES[1], description: 'Pro grade studio receiver with spatial sound.' },
      { product_id: 'p-3', title: 'Vortex Sapphire Smartwatch', brand: 'Vortex Luxe', category: 'Wearables', sku: 'VOR-882', image_url: SAMPLE_IMAGES[2], description: 'Titanium chassis smartwatch with health tracking.' },
      { product_id: 'p-4', title: 'Monarch Wireless Earbuds', brand: 'Monarch', category: 'Audio', sku: 'MON-302', image_url: SAMPLE_IMAGES[3], description: 'Active noise cancelling wireless earbuds.' },
      { product_id: 'p-5', title: 'Aether Precision Microphone', brand: 'Aether', category: 'Audio', sku: 'AET-771', image_url: SAMPLE_IMAGES[4], description: 'Broadcast grade condenser microphone.' }
    ];

    const q = query ? query.toLowerCase().trim() : '';
    const filtered = q ? fallbackCatalog.filter(i => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : fallbackCatalog;

    return {
      success: true,
      total: filtered.length,
      items: filtered,
      fallback: true
    };
  }
}

module.exports = { searchStoreCatalog };
