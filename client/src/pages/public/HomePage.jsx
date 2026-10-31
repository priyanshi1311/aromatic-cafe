import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { settingsService, tableService } from '../../services';
import { QRCode } from 'react-qrcode-logo';

const SEATING_ZONES = [
  {
    id: 'velvet-main',
    name: 'Velvet Dining Hall',
    area: 'Main Indoor Hall',
    capacity: '2 – 4 Guests',
    tag: 'Signature 🌸',
    icon: '🌸',
    image: '/cafe/velvet-dining.jpg',
    desc: 'Dine on polished marble tables with comfortable blush velvet armchairs and warm ambient chandeliers.',
    perks: ['Plush velvet seating', 'Marble dining tables', 'Warm aesthetic lighting'],
  },
  {
    id: 'arch-suite',
    name: 'Private Party Hall',
    area: 'Celebration Lounge',
    capacity: '6 – 15 Guests',
    tag: 'Celebration 👑',
    icon: '👑',
    image: '/cafe/party-hall.jpg',
    desc: 'Private celebration hall with crystal chandeliers, elegant banquet table, and custom party decorations.',
    perks: ['Crystal chandeliers', 'Private banquet setup', 'Birthday & anniversary decor'],
  },
  {
    id: 'floral-alcove',
    name: 'Floral Corner',
    area: 'Window Lounge',
    capacity: '2 – 4 Guests',
    tag: 'Photogenic ✨',
    icon: '✨',
    image: '/cafe/floral-corner.jpg',
    desc: 'Romantic floral setup with pink rose arches, natural sunlight, and picture-perfect aesthetic corners.',
    perks: ['Floral backdrop', 'Instagram photobooth', 'Cozy corner dining'],
  },
  {
    id: 'grand-facade',
    name: 'Rooftop Terrace',
    area: 'Open-Air Deck',
    capacity: '4 – 10 Guests',
    tag: 'Open Sky 🌿',
    icon: '🌿',
    image: '/cafe/rooftop-terrace.jpg',
    desc: 'Open-air rooftop seating under the evening sky with fairy lights, cool breeze, and panoramic outdoor views.',
    perks: ['Open-air rooftop dining', 'Fairy light canopy', 'Evening sunset views'],
  },
];

const PARTY_PACKAGES = [
  {
    title: 'Birthday Celebration Package',
    guests: 'Up to 25 Guests',
    price: 'Celebration Tier',
    icon: '🎂',
    badge: 'Popular',
    image: '/cafe/birthday-party.jpg',
    desc: 'Celebrate birthdays or anniversaries with festive table styling, celebration cake presentation, and warm party lights.',
    features: ['Festive Party Backdrop', 'Specialty Mocktail Flight', 'Dedicated Service Staff', 'Custom Party Food Menu'],
  },
  {
    title: 'High Tea & Kitty Party',
    guests: 'Up to 35 Guests',
    price: 'Group Special',
    icon: '🥂',
    badge: 'Exclusive',
    image: '/cafe/high-tea.jpg',
    desc: 'Perfect for kitty parties, family get-togethers, and celebrations with handcrafted snacks, shakes, and desserts.',
    features: ['Curated Snack Platters', 'Gourmet Beverages & Shakes', 'Dedicated Photo Corner', 'Comfortable Plush Seating'],
  },
  {
    title: 'Full Venue Booking',
    guests: 'Up to 100 Guests',
    price: 'Complete Buyout',
    icon: '🏰',
    badge: 'Grand Gathering',
    image: '/cafe/rooftop-terrace.jpg',
    desc: 'Exclusive access to our indoor velvet dining hall and open-air rooftop deck with complete hospitality service.',
    features: ['Indoor Hall & Rooftop Access', 'Live Kitchen & Fresh Serving', 'Custom Sound & Ambient Lighting', 'Full Hospitality Team'],
  },
];

const EXPERIENCE_PILLARS = [
  {
    icon: '🌸',
    title: 'Luxury Velvet Ambience',
    desc: 'Thoughtfully designed interiors with French wall moldings, warm chandeliers, and plush velvet dining chairs.',
    highlight: 'Aesthetic Ambience',
    image: '/cafe/velvet-dining.jpg',
  },
  {
    icon: '🌿',
    title: 'Open-Air Rooftop Deck',
    desc: 'Breezy rooftop terrace dining with ambient fairy lights and panoramic views for memorable dinners.',
    highlight: 'Rooftop Vibe',
    image: '/cafe/rooftop-terrace.jpg',
  },
  {
    icon: '✨',
    title: 'Ambient Evening Lounge',
    desc: 'Warm evening lighting, cozy lounge corners, and handcrafted mocktails for date nights and celebrations.',
    highlight: 'Night Glow',
    image: '/cafe/night-lounge.jpg',
  },
];

const MENU_CATEGORIES = [
  { id: 'beverages', label: '☕ Chai, Coffee & Mocktails' },
  { id: 'starters', label: '🍢 Tandoori & Starters' },
  { id: 'mains', label: '🍕 Pizzas, Pastas & Mains' },
  { id: 'desserts', label: '🍨 Desserts & Waffles' },
];

const MENU_ITEMS = {
  beverages: [
    {
      name: 'Special Masala Chai & Kulhad Chai',
      price: '₹90',
      badge: 'All-Time Fav',
      image: '/food/masala-chai.jpg',
      desc: 'Freshly brewed aromatic Indian tea infused with cardamom, ginger, cloves, and whole spices.',
    },
    {
      name: 'Classic Cold Coffee with Ice Cream',
      price: '₹180',
      badge: 'Bestseller',
      image: '/food/cold-coffee.jpg',
      desc: 'Rich blended espresso shake topped with a generous scoop of vanilla ice cream and chocolate drizzle.',
    },
    {
      name: 'Fresh Mint Virgin Mojito',
      price: '₹160',
      badge: 'Refreshing',
      image: '/food/virgin-mojito.jpg',
      desc: 'Crisp crushed mint leaves, fresh lime wedges, sparkling soda, and a dash of sweet mint syrup.',
    },
    {
      name: 'Hazelnut Caramel Frappe',
      price: '₹220',
      badge: 'Must Try',
      image: '/food/caramel-frappe.jpg',
      desc: 'Iced blended coffee with roasted hazelnut syrup, salted caramel swirl, and whipped cream.',
    },
  ],
  starters: [
    {
      name: 'Tandoori Paneer Tikka (Special)',
      price: '₹290',
      badge: 'Chef Special',
      image: '/food/paneer-tikka.jpg',
      desc: 'Fresh malai paneer cubes marinated in spiced yogurt and char-grilled in tandoor with capsicum and onions.',
    },
    {
      name: 'Crispy Peri Peri Cheese Fries',
      price: '₹180',
      badge: 'Crunchy',
      image: '/food/peri-peri-fries.jpg',
      desc: 'Golden crisp potato fries tossed in fiery African peri-peri seasoning and warm cheddar cheese sauce.',
    },
    {
      name: 'Melt-in-Mouth Dahi Ke Kebab',
      price: '₹260',
      badge: 'Signature',
      image: '/food/dahi-kebab.jpg',
      desc: 'Golden pan-fried hung curd patties with green chilies, fresh coriander, and mint-coriander chutney.',
    },
    {
      name: 'Crispy Sweet Corn Chaat',
      price: '₹190',
      badge: 'Popular',
      image: '/food/corn-chaat.jpg',
      desc: 'Crispy fried sweet corn tossed with freshly chopped onions, tomatoes, lemon juice, and chaat masala.',
    },
  ],
  mains: [
    {
      name: 'Farmhouse Gourmet Cheese Pizza',
      price: '₹380',
      badge: 'Wood Fired',
      image: '/food/farmhouse-pizza.jpg',
      desc: 'Handcrafted crisp crust loaded with mozzarella, bell peppers, golden corn, olives, mushrooms, and herbs.',
    },
    {
      name: 'Creamy Makhani Alfredo Fusion Pasta',
      price: '₹320',
      badge: 'Chef Fusion',
      image: '/food/makhani-pasta.jpg',
      desc: 'Penne pasta tossed in our signature blend of rich Indian makhani gravy and Italian creamy alfredo sauce.',
    },
    {
      name: 'Dal Makhani & Garlic Butter Naan Combo',
      price: '₹340',
      badge: 'Comfort Meal',
      image: '/food/dal-makhani.jpg',
      desc: 'Slow-cooked black lentils simmered overnight with butter and cream, served with fresh garlic butter naan.',
    },
    {
      name: 'Paneer Butter Masala with Laccha Paratha',
      price: '₹360',
      badge: 'Rich Gravy',
      image: '/food/paneer-butter-masala.jpg',
      desc: 'Soft cottage cheese cubes in silky tomato-cashew gravy with aromatic spices and layered crispy parathas.',
    },
  ],
  desserts: [
    {
      name: 'Sizzling Chocolate Brownie with Ice Cream',
      price: '₹220',
      badge: 'Crowd Favorite',
      image: '/food/sizzling-brownie.jpg',
      desc: 'Warm walnut fudge brownie served on a hot sizzler plate with vanilla ice cream and hot chocolate fudge.',
    },
    {
      name: 'Belgian Nutella Waffle',
      price: '₹240',
      badge: 'Sweet Tooth',
      image: '/food/nutella-waffle.jpg',
      desc: 'Golden crispy Belgian waffle slathered with pure Nutella, banana slices, and toasted almond flakes.',
    },
    {
      name: 'Gulab Jamun Cheesecake Jar',
      price: '₹190',
      badge: 'Fusion Dessert',
      image: '/food/cheesecake-jar.jpg',
      desc: 'Layered dessert jar with graham cracker crumble, silky cream cheese, and warm mini gulab jamuns.',
    },
    {
      name: 'Royal Kesar Pista Kulfi Sundae',
      price: '₹210',
      badge: 'Traditional',
      image: '/food/kulfi-sundae.jpg',
      desc: 'Creamy saffron pistachio kulfi served with falooda sev, rose syrup, and crunchy roasted nuts.',
    },
  ],
};

const REVIEWS = [
  {
    name: 'Rohit Verma',
    role: 'Local Foodie (Roorkee)',
    quote: 'One of the best aesthetic cafes in the city! The rooftop terrace seating in the evening is simply magical. Loved their cold coffee and Paneer Tikka.',
    stars: 5,
  },
  {
    name: 'Ananya Sharma',
    role: 'Birthday Celebration Host',
    quote: 'Booked the private celebration hall for my sister’s 21st birthday. The decor, fairy lights, and service were 10/10. Highly recommend for family gatherings!',
    stars: 5,
  },
  {
    name: 'Priya & Sahil',
    role: 'Regular Weekend Diners',
    quote: 'Such a romantic ambience with plush velvet seating. The instant QR table booking made the whole experience so smooth. Farmhouse Pizza and Sizzling Brownie are a must-try.',
    stars: 5,
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState('beverages');
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    Promise.all([
      settingsService.getPublicSettings(),
      tableService.getPublicTables(),
    ])
      .then(([sRes, tRes]) => {
        setSettings(sRes.data.data);
        const tbls = tRes.data.data || [];
        setTables(tbls);
        if (tbls.length > 0) setSelectedTableId(tbls[0]._id);
      })
      .catch(() => {});

    setBookingUrl(`${window.location.origin}/book`);
  }, []);

  const restaurantName = settings?.restaurantName || 'Aromatic';
  const selectedTable = tables.find(t => t._id === selectedTableId);
  const activeQRUrl = selectedTable 
    ? `${window.location.origin}/book?table=${selectedTable._id}` 
    : bookingUrl;

  const handleQuickBook = (tableId) => {
    const tid = tableId || selectedTableId;
    if (tid) {
      navigate(`/book?table=${tid}`);
    } else {
      navigate('/book');
    }
  };

  return (
    <div className="page-wrapper font-sans" style={{ background: '#fdf8f5' }}>
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #d85d85 0%, #b83a65 50%, #c59b27 100%)',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 700,
          textAlign: 'center',
          padding: '8px 16px',
          letterSpacing: '0.04em',
        }}
      >
        <span>🌸 Welcome to {restaurantName} · Reserve your table in our Velvet Salon or book our Private Arch Party Hall!</span>
      </div>

      {/* ── NAVBAR ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 250, 247, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #f3d7df',
          boxShadow: '0 2px 12px rgba(216, 93, 133, 0.05)',
        }}
      >
        <div className="page-container" style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #fce7ec 0%, #fdf2f4 100%)',
                border: '1.5px solid #f3d7df',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 4px 14px rgba(216, 93, 133, 0.15)',
              }}
            >
              🌸
            </div>
            <div>
              <div
                className="font-serif"
                style={{
                  fontWeight: 800,
                  color: '#1e293b',
                  fontSize: 20,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {restaurantName}
              </div>
              <div style={{ fontSize: 10, color: '#b83a65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
                Experiential Dining & Cafe
              </div>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            <a href="#seating" style={{ color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#d85d85'} onMouseLeave={e => e.target.style.color = '#475569'}>
              Table Seating
            </a>
            <a href="#party-hall" style={{ color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#d85d85'} onMouseLeave={e => e.target.style.color = '#475569'}>
              Party Hall & Events
            </a>
            <a href="#menu" style={{ color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#d85d85'} onMouseLeave={e => e.target.style.color = '#475569'}>
              Artisan Menu
            </a>
            <a href="#experience" style={{ color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#d85d85'} onMouseLeave={e => e.target.style.color = '#475569'}>
              The Venue
            </a>
            <a href="#qr-section" style={{ color: '#d85d85', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              QR Check-In
            </a>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#b83a65',
                background: '#fce7ec',
                border: '1.5px solid #f3d7df',
                padding: '8px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span>📱</span>
              <span className="hidden sm:inline">QR Check-In</span>
            </button>

            <Link
              to="/admin/login"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                background: '#ffffff',
                border: '1px solid #f3d7df',
                padding: '8px 14px',
                borderRadius: 12,
                textDecoration: 'none',
              }}
            >
              Staff
            </Link>

            <Link
              to="/book"
              className="btn-primary"
              style={{
                fontSize: 13,
                padding: '9px 20px',
                borderRadius: 12,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Book Table</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* ── HERO SECTION WITH COMPACT & AUTHENTIC AROMATIC SHOWCASE ── */}
        <section
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #fce7ec 0%, #fdf8f5 60%, #ffffff 100%)',
            padding: '48px 0 60px',
            borderBottom: '1px solid #f3d7df',
            overflow: 'hidden',
          }}
        >
          {/* Subtle floral background decorations */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(216,93,133,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,155,39,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'center' }} className="lg:grid-cols-12">
              
              {/* Left Column: Story & CTAs */}
              <div className="lg:col-span-6 animate-fade-in">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 16px',
                    borderRadius: 9999,
                    background: '#ffffff',
                    border: '1.5px solid #f3d7df',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#b83a65',
                    marginBottom: 18,
                    boxShadow: '0 2px 8px rgba(216,93,133,0.06)',
                  }}
                >
                  <span>🌸</span>
                  <span>Elevated Experiential Dining & Cafe Sanctuary</span>
                </div>

                <h1
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(32px, 4.8vw, 52px)',
                    fontWeight: 900,
                    color: '#1e293b',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.15,
                    marginBottom: 18,
                  }}
                >
                  Where Floral Elegance Meets{' '}
                  <span
                    style={{
                      color: '#d85d85',
                      fontStyle: 'italic',
                      textDecoration: 'underline',
                      textDecorationColor: '#f3d7df',
                      textUnderlineOffset: '8px',
                    }}
                  >
                    Exquisite Flavors
                  </span>
                </h1>

                <p
                  style={{
                    fontSize: 16,
                    color: '#475569',
                    lineHeight: 1.7,
                    marginBottom: 32,
                    maxWidth: 560,
                  }}
                >
                  Welcome to {restaurantName}. Immerse yourself in our plush velvet dining salons, private arched celebration suites, and sunlit marble tables. From artisanal coffees and handcrafted platters to dream birthday parties, experience dining elevated.
                </p>

                {/* Main CTAs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                  <Link
                    to="/book"
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '13px 28px',
                      fontSize: 14,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Reserve a Table</span>
                    <span>🍽️</span>
                  </Link>

                  <a
                    href="#party-hall"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '13px 24px',
                      borderRadius: 14,
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#b83a65',
                      background: '#ffffff',
                      border: '1.5px solid #f3d7df',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>Party Hall Booking</span>
                    <span>✨</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '13px 20px',
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#c59b27',
                      background: '#fff9ea',
                      border: '1.5px solid #fde68a',
                      cursor: 'pointer',
                    }}
                  >
                    <span>📱</span>
                    <span>Scan Table QR</span>
                  </button>
                </div>

                {/* Trust & Accolades */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, paddingTop: 20, borderTop: '1px solid #f3d7df' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#d85d85' }}>4.8 ★★★★★</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>200+ Verified Reviews</div>
                  </div>
                  <div style={{ width: 1, height: 36, background: '#f3d7df' }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#1e293b' }}>Pink Velvet</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Marble & Arch Salons</div>
                  </div>
                  <div style={{ width: 1, height: 36, background: '#f3d7df' }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#c59b27' }}>Party Hall</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Up to 100 Guests</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Authentic Aromatic Dining Salon Showcase */}
              <div className="lg:col-span-6 flex justify-center animate-fade-in" style={{ position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
                  
                  {/* Floating Review Card */}
                  <div
                    className="animate-float"
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -12,
                      zIndex: 10,
                      background: '#ffffff',
                      border: '1.5px solid #f3d7df',
                      borderRadius: 16,
                      padding: '8px 14px',
                      boxShadow: '0 8px 24px rgba(216,93,133,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      maxWidth: 230,
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#fce7ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                      ✨
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#b83a65', lineHeight: 1.2 }}>"Aromatic Dining"</div>
                      <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.2 }}>Plush Velvet & Chandeliers</div>
                    </div>
                  </div>

                  {/* Rectangular Photo Frame with authentic Aromatic interior */}
                  <div
                    style={{
                      borderRadius: 24,
                      padding: 6,
                      background: 'linear-gradient(135deg, #fce7ec 0%, #ffffff 50%, #fdf2f4 100%)',
                      border: '2px solid #f3d7df',
                      boxShadow: '0 20px 48px rgba(216, 93, 133, 0.16)',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 18,
                        overflow: 'hidden',
                        position: 'relative',
                        height: 520,
                        width: '100%',
                      }}
                    >
                      <img
                        src="/cafe/hero-main.jpg"
                        alt="Aromatic Luxury Dining Salon with plush velvet seating and chandeliers"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      {/* Subtle Bottom Gradient */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(30,41,59,0.8) 100%)',
                        }}
                      />

                      {/* Bottom Overlay Label */}
                      <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, color: '#ffffff' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            background: 'rgba(216,93,133,0.92)',
                            backdropFilter: 'blur(6px)',
                            padding: '4px 11px',
                            borderRadius: 9999,
                            display: 'inline-block',
                            marginBottom: 6,
                          }}
                        >
                          🌸 Aromatic Salon
                        </span>
                        <div className="font-serif" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>
                          Plush Velvet Chairs & Marble Tables
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -10,
                      right: -10,
                      background: '#ffffff',
                      border: '1.5px solid #f3d7df',
                      borderRadius: 14,
                      padding: '6px 14px',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#b83a65',
                    }}
                  >
                    <span>🌸</span>
                    <span>Aromatic Experience</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── FAST QR TABLE REGISTER & AUTO-LOCK SECTION ── */}
        <section
          id="qr-section"
          style={{
            width: '100%',
            padding: '52px 0',
            background: '#ffffff',
            borderBottom: '1px solid #f3d7df',
          }}
        >
          <div className="page-container">
            <div
              style={{
                background: 'linear-gradient(135deg, #fffaf7 0%, #fdf2f4 50%, #fce7ec 100%)',
                borderRadius: 24,
                border: '1.5px solid #f3d7df',
                padding: '32px 28px',
                boxShadow: '0 8px 30px rgba(216,93,133,0.06)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'center' }} className="lg:grid-cols-12">
                
                {/* Left: Scannable QR Card */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 22,
                      padding: 22,
                      border: '1.5px solid #f3d7df',
                      boxShadow: '0 8px 24px rgba(216,93,133,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      maxWidth: 290,
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        background: '#fdf8f5',
                        borderRadius: 16,
                        border: '1px solid #f3d7df',
                        marginBottom: 12,
                      }}
                    >
                      <QRCode
                        value={activeQRUrl}
                        size={170}
                        bgColor="#ffffff"
                        fgColor="#1e293b"
                        qrStyle="squares"
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#b83a65',
                        background: '#fce7ec',
                        padding: '4px 12px',
                        borderRadius: 9999,
                        border: '1px solid #f3d7df',
                      }}
                    >
                      ● Point Phone Camera Here
                    </span>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                      Scan directly from your mobile camera to open instant table booking
                    </p>
                  </div>
                </div>

                {/* Right: Quick Table Selector */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#b83a65',
                        background: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: 9999,
                        border: '1px solid #f3d7df',
                      }}
                    >
                      📱 Instant Table Registration
                    </span>
                    <h2
                      className="font-serif"
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: '#1e293b',
                        letterSpacing: '-0.02em',
                        marginTop: 10,
                      }}
                    >
                      Already Seated at {restaurantName}?
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginTop: 4 }}>
                      Select your physical table number below. Your table will be instantly pre-locked with your seating capacity!
                    </p>
                  </div>

                  {/* Table Selection Pills */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                      Click Your Table Number:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {tables.map(t => {
                        const isSel = selectedTableId === t._id;
                        return (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => setSelectedTableId(t._id)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                              border: isSel ? '2px solid #d85d85' : '1.5px solid #f3d7df',
                              background: isSel ? '#d85d85' : '#ffffff',
                              color: isSel ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: isSel ? '0 4px 12px rgba(216,93,133,0.25)' : 'none',
                            }}
                          >
                            <span>🪑 Table {t.tableNumber}</span>
                            <span style={{ fontSize: 10, opacity: isSel ? 0.9 : 0.6 }}>({t.capacity}p)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Table Preview Banner */}
                  {selectedTable && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #f3d7df',
                        borderRadius: 16,
                        padding: '14px 18px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: '#fce7ec',
                            color: '#b83a65',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                          }}
                        >
                          🌸
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
                            Table {selectedTable.tableNumber} Selected ({selectedTable.location || 'Velvet Salon'})
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Capacity: {selectedTable.capacity} Guests · Ready for instant registration
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickBook(selectedTable._id)}
                        className="btn-primary"
                        style={{
                          padding: '8px 18px',
                          fontSize: 12,
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>Book Table {selectedTable.tableNumber}</span>
                        <span>→</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ── TABLE RESERVATION SHOWCASE (WITH AUTHENTIC AROMATIC CAFE PHOTOS) ── */}
        <section
          id="seating"
          style={{
            width: '100%',
            padding: '64px 0',
            background: '#fdf8f5',
            borderBottom: '1px solid #f3d7df',
          }}
        >
          <div className="page-container">
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#b83a65',
                  display: 'inline-block',
                  background: '#fce7ec',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  border: '1px solid #f3d7df',
                  marginBottom: 8,
                }}
              >
                Table Reservations
              </span>
              <h2
                className="font-serif"
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                }}
              >
                Curated Dining & Seating Zones
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
                Experience the authentic atmosphere of {restaurantName} — from our plush velvet dining hall to private arched suites and scenic terraces.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 22 }}>
              {SEATING_ZONES.map(z => (
                <div
                  key={z.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #f3d7df',
                    borderRadius: 20,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 18px rgba(216,93,133,0.05)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#d85d85';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#f3d7df';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Authentic Cafe Photo Banner */}
                    <div style={{ height: 175, position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={z.image}
                        alt={z.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'rgba(255,255,255,0.92)',
                          backdropFilter: 'blur(8px)',
                          color: '#b83a65',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 9999,
                          border: '1px solid #f3d7df',
                        }}
                      >
                        {z.tag}
                      </span>
                    </div>

                    <div style={{ padding: '20px 20px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#c59b27', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {z.area}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                          👥 {z.capacity}
                        </span>
                      </div>

                      <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                        {z.name}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                        {z.desc}
                      </p>

                      {/* Zone Perks */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {z.perks.map((p, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#475569',
                              background: '#fdf8f5',
                              border: '1px solid #f3d7df',
                              padding: '3px 8px',
                              borderRadius: 6,
                            }}
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 20px 18px' }}>
                    <Link
                      to="/book"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        width: '100%',
                        padding: '10px 0',
                        borderRadius: 12,
                        background: '#fdf8f5',
                        border: '1.5px solid #f3d7df',
                        color: '#b83a65',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#d85d85';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = '#d85d85';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#fdf8f5';
                        e.currentTarget.style.color = '#b83a65';
                        e.currentTarget.style.borderColor = '#f3d7df';
                      }}
                    >
                      <span>Reserve This Area</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTY HALL & CELEBRATION BOOKINGS (AUTHENTIC AROMATIC PARTY SUITE PHOTOS) ── */}
        <section
          id="party-hall"
          style={{
            width: '100%',
            padding: '68px 0',
            background: 'linear-gradient(180deg, #ffffff 0%, #fffaf7 100%)',
            borderBottom: '1px solid #f3d7df',
          }}
        >
          <div className="page-container">
            <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 40px' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#c59b27',
                  display: 'inline-block',
                  background: '#fff9ea',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  border: '1px solid #fde68a',
                  marginBottom: 10,
                }}
              >
                ✨ Private Celebrations & Banquets
              </span>
              <h2
                className="font-serif"
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                }}
              >
                Party Hall & Event Packages
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, lineHeight: 1.6 }}>
                Host your dream Birthday Party, Anniversary, or Family Gathering in our signature pink arch hall with crystal chandeliers and bespoke hospitality.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 24 }}>
              {PARTY_PACKAGES.map((pkg, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #f3d7df',
                    borderRadius: 22,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 6px 20px rgba(216,93,133,0.05)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#d85d85';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#f3d7df';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Photo Header */}
                    <div style={{ height: 185, position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          background: 'rgba(255,255,255,0.92)',
                          backdropFilter: 'blur(8px)',
                          padding: '3px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#b83a65',
                        }}
                      >
                        👥 {pkg.guests}
                      </div>
                    </div>

                    <div style={{ padding: '22px 22px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#c59b27', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {pkg.price}
                      </span>
                      <h3 className="font-serif" style={{ fontSize: 19, fontWeight: 800, color: '#1e293b', marginTop: 4, marginBottom: 8 }}>
                        {pkg.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
                        {pkg.desc}
                      </p>

                      <div style={{ borderTop: '1px solid #fce7ec', paddingTop: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                          Package Highlights:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                              <span style={{ color: '#d85d85', fontWeight: 800 }}>🌸</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 22px 20px' }}>
                    <Link
                      to={`/book?package=${encodeURIComponent(pkg.title)}`}
                      className="btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '11px 0',
                        fontSize: 13,
                        textDecoration: 'none',
                        borderRadius: 12,
                      }}
                    >
                      <span>Inquire / Book This Package</span>
                      <span>✨</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ARTISANAL FOOD & BEVERAGE MENU (CLEAN TYPOGRAPHIC MENU) ── */}
        <section
          id="menu"
          style={{
            width: '100%',
            padding: '68px 0',
            background: '#fdf8f5',
            borderBottom: '1px solid #f3d7df',
          }}
        >
          <div className="page-container">
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#b83a65',
                  display: 'inline-block',
                  background: '#fce7ec',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  border: '1px solid #f3d7df',
                  marginBottom: 8,
                }}
              >
                Artisanal Kitchen & Cafe
              </span>
              <h2
                className="font-serif"
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                }}
              >
                Signature Dining & Floral Brews
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
                Every meal is prepared fresh with premium ingredients, authentic recipes, and specialty barista craft.
              </p>
            </div>

            {/* Menu Category Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 36 }}>
              {MENU_CATEGORIES.map(cat => {
                const isAct = activeMenuTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveMenuTab(cat.id)}
                    style={{
                      padding: '9px 20px',
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      border: isAct ? '2px solid #d85d85' : '1.5px solid #f3d7df',
                      background: isAct ? '#d85d85' : '#ffffff',
                      color: isAct ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isAct ? '0 4px 14px rgba(216,93,133,0.2)' : 'none',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Rich Gourmet Menu Grid with Dish Photos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {MENU_ITEMS[activeMenuTab]?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #f3d7df',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(216,93,133,0.05)',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#d85d85';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(216,93,133,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#f3d7df';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(216,93,133,0.05)';
                  }}
                >
                  {/* Dish Photo */}
                  <div style={{ height: 175, width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    
                    {/* Badge */}
                    {item.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#b83a65',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(4px)',
                          padding: '3px 9px',
                          borderRadius: 9999,
                          border: '1px solid #f3d7df',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Price Tag Overlay */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#ffffff',
                        background: 'rgba(216, 93, 133, 0.92)',
                        backdropFilter: 'blur(4px)',
                        padding: '3px 10px',
                        borderRadius: 8,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                      }}
                    >
                      {item.price}
                    </span>
                  </div>

                  {/* Dish Details */}
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h4 className="font-serif" style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6, lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE VENUE SHOWCASE (WITH REAL AROMATIC PHOTOS) ── */}
        <section
          id="experience"
          style={{
            width: '100%',
            padding: '68px 0',
            background: '#ffffff',
            borderBottom: '1px solid #f3d7df',
          }}
        >
          <div className="page-container">
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#b83a65',
                  display: 'inline-block',
                  background: '#fce7ec',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  border: '1px solid #f3d7df',
                  marginBottom: 8,
                }}
              >
                The Destination
              </span>
              <h2
                className="font-serif"
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                }}
              >
                The {restaurantName} Experience
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
                Every level of our venue is thoughtfully curated for romantic dates, memorable celebrations, and fine dining.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
              {EXPERIENCE_PILLARS.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fdf8f5',
                    border: '1.5px solid #f3d7df',
                    borderRadius: 22,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ height: 180, overflow: 'hidden' }}>
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>

                  <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{p.icon}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#b83a65',
                          background: '#ffffff',
                          border: '1px solid #f3d7df',
                          padding: '3px 10px',
                          borderRadius: 9999,
                        }}
                      >
                        {p.highlight}
                      </span>
                    </div>

                    <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
                      {p.title}
                    </h3>

                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CUSTOMER REVIEWS ── */}
        <section
          style={{
            width: '100%',
            padding: '64px 0',
            background: '#fdf8f5',
            borderBottom: '1px solid #f3d7df',
          }}
        >
          <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c59b27' }}>
                Guest Love
              </span>
              <h2 className="font-serif" style={{ fontSize: 30, fontWeight: 800, color: '#1e293b', marginTop: 6 }}>
                Stories from Our Guests
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {REVIEWS.map((r, i) => (
                <div key={i} className="card" style={{ padding: '24px 22px', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid #f3d7df', borderRadius: 20 }}>
                  <div>
                    <div style={{ color: '#c59b27', fontSize: 16, marginBottom: 10 }}>
                      {'★'.repeat(r.stars)}
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 18 }}>
                      "{r.quote}"
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid #fce7ec', paddingTop: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#b83a65', fontWeight: 600 }}>{r.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL INVITATION BANNER ── */}
        <section style={{ width: '100%', padding: '56px 0', background: '#ffffff' }}>
          <div className="page-container">
            <div
              style={{
                background: 'linear-gradient(135deg, #d85d85 0%, #b83a65 50%, #9b2c52 100%)',
                borderRadius: 24,
                padding: '52px 36px',
                textAlign: 'center',
                color: '#ffffff',
                boxShadow: '0 16px 40px rgba(216,93,133,0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  Limited Tables Daily
                </span>
                <h2 className="font-serif" style={{ fontSize: 'clamp(26px, 3.8vw, 38px)', fontWeight: 800, marginBottom: 14 }}>
                  Ready to Experience {restaurantName}?
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: 28 }}>
                  Whether reserving a velvet salon booth or booking our private celebration party hall, secure your date in less than 2 minutes.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                  <Link
                    to="/book"
                    style={{
                      padding: '13px 32px',
                      borderRadius: 14,
                      background: '#ffffff',
                      color: '#b83a65',
                      fontSize: 14,
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                  >
                    Reserve Your Table 🍽️
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    style={{
                      padding: '13px 24px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.15)',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📱 Mobile QR Scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── QR CODE POPUP MODAL ── */}
      {showQRModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(30,41,59,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              maxWidth: 420,
              width: '100%',
              padding: 26,
              boxShadow: '0 20px 50px rgba(216,93,133,0.2)',
              position: 'relative',
              textAlign: 'center',
              border: '1.5px solid #f3d7df',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: '#fce7ec',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                fontSize: 15,
                cursor: 'pointer',
                color: '#b83a65',
              }}
            >
              ✕
            </button>

            <span style={{ fontSize: 10, fontWeight: 700, color: '#b83a65', background: '#fce7ec', padding: '4px 12px', borderRadius: 9999, border: '1px solid #f3d7df' }}>
              🌸 Table QR Reservation
            </span>
            <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginTop: 8, marginBottom: 4 }}>
              Scan to Book on Phone
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
              Point your smartphone camera at this code to open instant reservation
            </p>

            <div style={{ display: 'inline-block', padding: 12, background: '#fdf8f5', borderRadius: 18, border: '1.5px solid #f3d7df', marginBottom: 14 }}>
              <QRCode
                value={activeQRUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#1e293b"
                qrStyle="squares"
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Select Table to Pre-Lock (Optional):
              </label>
              <select
                value={selectedTableId}
                onChange={e => setSelectedTableId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #f3d7df',
                  fontSize: 12,
                  background: '#ffffff',
                  outline: 'none',
                  color: '#1e293b',
                  cursor: 'pointer',
                }}
              >
                {tables.map(t => (
                  <option key={t._id} value={t._id}>
                    Table {t.tableNumber} — {t.location || 'Velvet Salon'} ({t.capacity} Guests)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowQRModal(false);
                handleQuickBook(selectedTableId);
              }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: 12,
                fontSize: 13,
              }}
            >
              Continue on This Browser →
            </button>
          </div>
        </div>
      )}

      {/* ── FOOTER WITH REAL AROMATIC ADDRESS & CONTACT ── */}
      <footer style={{ background: '#1e293b', color: '#94a3b8', padding: '48px 0 24px' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #d85d85, #b83a65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  🌸
                </div>
                <span className="font-serif" style={{ fontWeight: 800, color: '#ffffff', fontSize: 19 }}>
                  {restaurantName}
                </span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: '#94a3b8' }}>
                Elevated experiential dining, plush velvet salons, private celebration suites, and multi-tier venue architecture.
              </p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#ffffff', marginBottom: 12, fontSize: 13 }}>Quick Navigation</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#seating" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#f9a8d4'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Table Reservations</a>
                <a href="#party-hall" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#f9a8d4'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Party Hall & Events</a>
                <a href="#menu" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#f9a8d4'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Signature Menu</a>
                <a href="#experience" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#f9a8d4'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>The Venue</a>
              </div>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#ffffff', marginBottom: 12, fontSize: 13 }}>Opening Hours</p>
              <div style={{ fontSize: 12, lineHeight: 1.9, color: '#94a3b8' }}>
                <div>Monday – Sunday: 11:00 AM – 11:00 PM</div>
                <div>Lunch Dining: 12:00 PM – 04:00 PM</div>
                <div style={{ color: '#f9a8d4', fontWeight: 600, marginTop: 4 }}>
                  Evening & Party Service: 06:00 PM – 11:00 PM
                </div>
              </div>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#ffffff', marginBottom: 12, fontSize: 13 }}>Location & Booking</p>
              <div style={{ fontSize: 12, lineHeight: 1.9, color: '#94a3b8' }}>
                <div>📍 NH 58, next to Solani Bridge, Haridwar Road</div>
                <div>Roorkee, Uttarakhand 247667</div>
                <div>📞 <a href="tel:+918077049464" style={{ color: '#94a3b8', textDecoration: 'none' }}>+91 8077049464</a></div>
                <div>💬 <a href="https://wa.me/918077049464" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>WhatsApp: +91 8077049464</a></div>
                <div style={{ color: '#c59b27', fontWeight: 700 }}>Instagram: @aromatic_rke</div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 11, color: '#64748b' }}>
            <span>© {new Date().getFullYear()} {restaurantName}. All rights reserved.</span>
            <span>Experiential Dining & Celebrations 🌸</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;