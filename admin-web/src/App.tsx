import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Image,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Database,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { api, type OrganizationPayload } from './api';
import type {
  ActivityLog,
  AdminMembership,
  AuthUser,
  Banner,
  BookingItem,
  DashboardStats,
  NewsItem,
  Organization,
  ReviewItem,
  ServiceItem,
} from './types';

const testAccounts = [
  {
    section: 'System Admin',
    label: 'Super Admin',
    email: 'admin@example.com',
    password: 'Admin@123456',
    role: 'super_admin',
    scope: 'Full system access',
    url: 'https://pet-app-admin.pages.dev/',
  },
  {
    section: 'Organization Admin',
    label: 'Shop Admin',
    email: 'shop-admin@example.com',
    password: 'Shop@123456',
    role: 'shop_admin',
    scope: 'Happy Paws Shop',
    url: 'https://pet-app-admin.pages.dev/',
  },
  {
    section: 'Organization Admin',
    label: 'Clinic Admin',
    email: 'clinic-admin@example.com',
    password: 'Clinic@123456',
    role: 'clinic_admin',
    scope: 'Care Pet Clinic',
    url: 'https://pet-app-admin.pages.dev/',
  },
  {
    section: 'Mobile User',
    label: 'Pet Owner',
    email: 'user@example.com',
    password: 'User@123456',
    role: 'user',
    scope: 'Mobile favorites, reviews, and bookings',
    url: 'Mobile app',
  },
];

type Tab =
  | 'dashboard'
  | 'shops'
  | 'clinics'
  | 'admins'
  | 'news'
  | 'banners'
  | 'logs'
  | 'org-dashboard'
  | 'profile'
  | 'services'
  | 'own-news'
  | 'reviews'
  | 'bookings';

type LoadState = {
  dashboard?: DashboardStats;
  shops: Organization[];
  clinics: Organization[];
  admins: AdminMembership[];
  news: NewsItem[];
  banners: Banner[];
  logs: ActivityLog[];
  adminProfile?: Organization;
  services: ServiceItem[];
  reviews: ReviewItem[];
  bookings: BookingItem[];
};

const tokenKey = 'pet-admin-token';

const emptyData: LoadState = {
  shops: [],
  clinics: [],
  admins: [],
  news: [],
  banners: [],
  logs: [],
  services: [],
  reviews: [],
  bookings: [],
};

function searchableText(...values: unknown[]) {
  return values
    .filter((value) => value !== null && value !== undefined)
    .join(' ')
    .toLowerCase();
}

function includesSearch(text: string, search: string) {
  return text.includes(search.trim().toLowerCase());
}

function App() {
  if (window.location.hash === '#/users') {
    return <UsersPage />;
  }

  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<LoadState>(emptyData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState<'checking' | 'ok' | 'error'>('checking');

  async function loadAll(currentToken = token) {
    if (!currentToken) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await api.me(currentToken);
      setUser(profile);
      if (profile.role === 'super_admin') {
        const [dashboard, shops, clinics, admins, news, banners, logs] = await Promise.all([
          api.dashboard(currentToken),
          api.shops(currentToken),
          api.clinics(currentToken),
          api.admins(currentToken),
          api.news(currentToken),
          api.banners(currentToken),
          api.activityLogs(currentToken),
        ]);
        setData({
          ...emptyData,
          dashboard,
          shops: shops.items,
          clinics: clinics.items,
          admins: admins.items,
          news: news.items,
          banners: banners.items,
          logs: logs.items,
        });
      } else {
        const [adminProfile, services, news, reviews, bookings] = await Promise.all([
          api.adminProfile(currentToken),
          api.adminServices(currentToken),
          api.news(currentToken),
          api.adminReviews(currentToken),
          api.adminBookings(currentToken),
        ]);
        setData({
          ...emptyData,
          adminProfile,
          services: services.items,
          news: news.items,
          reviews: reviews.items,
          bookings: bookings.items,
        });
        setTab((current) =>
          ['dashboard', 'shops', 'clinics', 'admins', 'banners', 'logs'].includes(current)
            ? 'org-dashboard'
            : current,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin data');
      if (!user) {
        localStorage.removeItem(tokenKey);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void api
      .databaseHealth()
      .then(() => setApiReady('ok'))
      .catch(() => setApiReady('error'));
  }, []);

  useEffect(() => {
    if (token) void loadAll(token);
  }, [token]);

  function signOut() {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
    setData(emptyData);
  }

  if (!token || !user) {
    return (
      <LoginScreen
        apiReady={apiReady}
        error={error}
        onLogin={(nextToken) => {
          localStorage.setItem(tokenKey, nextToken);
          setToken(nextToken);
        }}
      />
    );
  }

  const activeOrgs = [...data.shops, ...data.clinics].filter((org) => org.status === 'active').length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>Pet Platform</strong>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="nav">
          {user.role === 'super_admin' ? (
            <>
              <NavButton icon={<LayoutDashboard size={18} />} active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
                Dashboard
              </NavButton>
              <NavButton icon={<Store size={18} />} active={tab === 'shops'} onClick={() => setTab('shops')}>
                Shops
              </NavButton>
              <NavButton icon={<HeartPulse size={18} />} active={tab === 'clinics'} onClick={() => setTab('clinics')}>
                Clinics
              </NavButton>
              <NavButton icon={<Users size={18} />} active={tab === 'admins'} onClick={() => setTab('admins')}>
                Admins
              </NavButton>
              <NavButton icon={<Activity size={18} />} active={tab === 'news'} onClick={() => setTab('news')}>
                News
              </NavButton>
              <NavButton icon={<Image size={18} />} active={tab === 'banners'} onClick={() => setTab('banners')}>
                Banners
              </NavButton>
              <NavButton icon={<Database size={18} />} active={tab === 'logs'} onClick={() => setTab('logs')}>
                Logs
              </NavButton>
            </>
          ) : (
            <>
              <NavButton icon={<LayoutDashboard size={18} />} active={tab === 'org-dashboard'} onClick={() => setTab('org-dashboard')}>
                Dashboard
              </NavButton>
              <NavButton icon={<Building2 size={18} />} active={tab === 'profile'} onClick={() => setTab('profile')}>
                Profile
              </NavButton>
              <NavButton icon={<Store size={18} />} active={tab === 'services'} onClick={() => setTab('services')}>
                Services
              </NavButton>
              <NavButton icon={<Activity size={18} />} active={tab === 'own-news'} onClick={() => setTab('own-news')}>
                News
              </NavButton>
              <NavButton icon={<MessageSquare size={18} />} active={tab === 'reviews'} onClick={() => setTab('reviews')}>
                Reviews
              </NavButton>
              <NavButton icon={<CalendarCheck size={18} />} active={tab === 'bookings'} onClick={() => setTab('bookings')}>
                Bookings
              </NavButton>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{user.fullName ?? user.email}</span>
            <small>{user.role}</small>
          </div>
          <button className="icon-button" onClick={signOut} title="Sign out" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{titleForTab(tab)}</h1>
            <p>{subtitleForTab(tab)}</p>
          </div>
          <button className="secondary-button" onClick={() => void loadAll()} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {message && <Notice tone="success" text={message} onClose={() => setMessage(null)} />}
        {error && <Notice tone="error" text={error} onClose={() => setError(null)} />}

        {tab === 'dashboard' && (
          <DashboardPanel
            dashboard={data.dashboard}
            activeOrgs={activeOrgs}
            apiReady={apiReady}
            loading={loading}
          />
        )}

        {tab === 'shops' && (
          <OrganizationPanel
            type="shop"
            token={token}
            items={data.shops}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'clinics' && (
          <OrganizationPanel
            type="clinic"
            token={token}
            items={data.clinics}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'admins' && (
          <AdminsPanel
            token={token}
            admins={data.admins}
            organizations={[...data.shops, ...data.clinics]}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'news' && (
          <NewsPanel
            token={token}
            news={data.news}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'banners' && (
          <BannersPanel
            token={token}
            banners={data.banners}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'logs' && <LogsPanel logs={data.logs} />}

        {tab === 'org-dashboard' && (
          <OrganizationDashboard profile={data.adminProfile} services={data.services} news={data.news} />
        )}

        {tab === 'profile' && data.adminProfile && (
          <ProfilePanel
            token={token}
            profile={data.adminProfile}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'services' && (
          <ServicesPanel
            token={token}
            services={data.services}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'own-news' && data.adminProfile && (
          <NewsPanel
            token={token}
            news={data.news}
            organizationId={data.adminProfile.id}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'reviews' && (
          <ReviewsPanel
            token={token}
            reviews={data.reviews}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}

        {tab === 'bookings' && (
          <BookingsPanel
            token={token}
            bookings={data.bookings}
            onChanged={(text) => {
              setMessage(text);
              void loadAll();
            }}
            onError={setError}
          />
        )}
      </main>
    </div>
  );
}

function OrganizationDashboard({
  profile,
  services,
  news,
}: {
  profile?: Organization;
  services: ServiceItem[];
  news: NewsItem[];
}) {
  return (
    <section className="dashboard-grid">
      <MetricCard icon={<Building2 size={20} />} label="Organization" value={profile ? 1 : 0} />
      <MetricCard icon={<Store size={20} />} label="Services" value={services.length} />
      <MetricCard icon={<Activity size={20} />} label="News" value={news.length} />
      <MetricCard
        icon={<CheckCircle2 size={20} />}
        label="Published"
        value={services.filter((service) => service.status === 'published').length}
      />
      <div className="wide-panel">
        <h2>{profile?.name ?? 'Organization'}</h2>
        <div className="status-list">
          <span>Type</span>
          <strong>{profile?.type ?? '-'}</strong>
          <span>Status</span>
          <strong>{profile?.status ?? '-'}</strong>
          <span>Contact</span>
          <strong>{profile?.phone ?? profile?.email ?? '-'}</strong>
        </div>
      </div>
    </section>
  );
}

function ProfilePanel({
  token,
  profile,
  onChanged,
  onError,
}: {
  token: string;
  profile: Organization;
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState<OrganizationPayload>({
    name: profile.name,
    description: profile.description,
    logoUrl: profile.logo_url,
    coverUrl: profile.cover_url,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    province: profile.province,
    district: profile.district,
    subdistrict: profile.subdistrict,
    status: profile.status,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  async function uploadProfileImage(file: File, field: 'logoUrl' | 'coverUrl') {
    setUploading(field);
    try {
      const upload = await api.uploadAsset(token, 'organizations', file);
      setForm((current) => ({ ...current, [field]: upload.publicUrl }));
      onChanged(`Uploaded ${field === 'logoUrl' ? 'logo' : 'cover'} image`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(null);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.updateAdminProfile(token, cleanOrganizationPayload(form));
      onChanged('Updated organization profile');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to update profile');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-panel wide-form" onSubmit={submit}>
      <h2>
        <Building2 size={18} />
        Organization profile
      </h2>
      <div className="form-columns">
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as OrganizationPayload['status'] })}
          >
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="inactive">inactive</option>
            <option value="suspended">suspended</option>
          </select>
        </label>
        <label>
          Phone
          <input value={form.phone ?? ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
      </div>
      <label>
        Address
        <textarea value={form.address ?? ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
      </label>
      <div className="form-columns">
        <label>
          Logo URL
          <input value={form.logoUrl ?? ''} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} />
        </label>
        <label>
          Cover URL
          <input value={form.coverUrl ?? ''} onChange={(event) => setForm({ ...form, coverUrl: event.target.value })} />
        </label>
        <label>
          Upload logo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadProfileImage(file, 'logoUrl');
              event.target.value = '';
            }}
          />
        </label>
        <label>
          Upload cover
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadProfileImage(file, 'coverUrl');
              event.target.value = '';
            }}
          />
        </label>
      </div>
      <button className="primary-button" disabled={busy}>
        <CheckCircle2 size={16} />
        Save profile
      </button>
    </form>
  );
}

function ServicesPanel({
  token,
  services,
  onChanged,
  onError,
}: {
  token: string;
  services: ServiceItem[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    durationMinutes: '',
    status: 'published' as ServiceItem['status'],
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const visibleServices = useMemo(
    () =>
      services.filter((service) =>
        includesSearch(searchableText(service.name, service.description, service.status, service.price), search),
      ),
    [services, search],
  );

  async function uploadServiceImage(file: File) {
    setUploading(true);
    try {
      const upload = await api.uploadAsset(token, 'services', file);
      setForm((current) => ({ ...current, imageUrl: upload.publicUrl }));
      onChanged('Uploaded service image');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createAdminService(token, {
        name: form.name,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        price: form.price ? Number(form.price) : null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        status: form.status,
      });
      setForm({ name: '', description: '', imageUrl: '', price: '', durationMinutes: '', status: 'published' });
      onChanged('Created service');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to create service');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this service?')) return;
    try {
      await api.deleteAdminService(token, id);
      onChanged('Deleted service');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to delete service');
    }
  }

  async function setStatus(id: string, status: ServiceItem['status']) {
    try {
      await api.updateAdminService(token, id, { status });
      onChanged(`Service marked ${status}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to update service');
    }
  }

  return (
    <div className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <h2>
          <Plus size={18} />
          New service
        </h2>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <label>
          Image URL
          <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        </label>
        <label>
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadServiceImage(file);
              event.target.value = '';
            }}
          />
        </label>
        <div className="split-row">
          <label>
            Price
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </label>
          <label>
            Minutes
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
            />
          </label>
        </div>
        <label>
          Status
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as ServiceItem['status'] })}
          >
            <option value="published">published</option>
            <option value="draft">draft</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <button className="primary-button" disabled={busy}>
          <Plus size={16} />
          Create service
        </button>
      </form>

      <section className="table-panel">
        <div className="panel-heading">
          <h2>Services</h2>
          <span>{visibleServices.length} records</span>
        </div>
        <div className="table-tools">
          <input placeholder="Search services" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Price</th>
              <th>Minutes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleServices.map((service) => (
              <tr key={service.id}>
                <td>
                  <strong>{service.name}</strong>
                  <small>{service.description ?? service.id}</small>
                </td>
                <td>
                  <span className={`pill ${service.status}`}>{service.status}</span>
                </td>
                <td>{service.price ?? '-'}</td>
                <td>{service.duration_minutes ?? '-'}</td>
                <td className="actions wide-actions">
                  <button className="secondary-button" onClick={() => void setStatus(service.id, 'published')}>
                    Publish
                  </button>
                  <button className="secondary-button" onClick={() => void setStatus(service.id, 'draft')}>
                    Draft
                  </button>
                  <button className="icon-button danger" onClick={() => void remove(service.id)} title="Delete" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {visibleServices.length === 0 && <EmptyRow columns={5} />}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function NewsPanel({
  token,
  news,
  organizationId = null,
  onChanged,
  onError,
}: {
  token: string;
  news: NewsItem[];
  organizationId?: string | null;
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    coverImage: '',
    type: 'global' as NewsItem['type'],
    status: 'published' as NewsItem['status'],
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const visibleNews = useMemo(
    () =>
      news.filter((item) =>
        includesSearch(searchableText(item.title, item.content, item.type, item.status), search),
      ),
    [news, search],
  );

  async function uploadCoverImage(file: File) {
    setUploading(true);
    try {
      const upload = await api.uploadAsset(token, 'news', file);
      setForm((current) => ({ ...current, coverImage: upload.publicUrl }));
      onChanged('Uploaded news cover');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createNews(token, {
        ...form,
        coverImage: form.coverImage || null,
        organizationId,
        publishedAt: form.status === 'published' ? new Date().toISOString() : null,
      });
      setForm({ title: '', content: '', coverImage: '', type: 'global', status: 'published' });
      onChanged('Created news');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to create news');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this news item?')) return;
    try {
      await api.deleteNews(token, id);
      onChanged('Deleted news');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to delete news');
    }
  }

  async function setStatus(item: NewsItem, status: NewsItem['status']) {
    try {
      await api.updateNews(token, item.id, {
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : item.published_at,
      });
      onChanged(`News marked ${status}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to update news');
    }
  }

  return (
    <div className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <h2>
          <Plus size={18} />
          New news
        </h2>
        <label>
          Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </label>
        <label>
          Content
          <textarea
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            required
          />
        </label>
        <label>
          Cover image URL
          <input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} />
        </label>
        <label>
          Upload cover
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadCoverImage(file);
              event.target.value = '';
            }}
          />
        </label>
        <div className="split-row">
          <label>
            Type
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as NewsItem['type'] })}
            >
              <option value="global">global</option>
              <option value="promotion">promotion</option>
              <option value="announcement">announcement</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as NewsItem['status'] })}
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
          </label>
        </div>
        <button className="primary-button" disabled={busy}>
          <Plus size={16} />
          Create news
        </button>
      </form>

      <section className="table-panel">
        <div className="panel-heading">
          <h2>News</h2>
          <span>{visibleNews.length} records</span>
        </div>
        <div className="table-tools">
          <input placeholder="Search news" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleNews.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <small>{item.content}</small>
                </td>
                <td>{item.type}</td>
                <td>
                  <span className={`pill ${item.status}`}>{item.status}</span>
                </td>
                <td className="actions wide-actions">
                  <button className="secondary-button" onClick={() => void setStatus(item, 'published')}>
                    Publish
                  </button>
                  <button className="secondary-button" onClick={() => void setStatus(item, 'draft')}>
                    Draft
                  </button>
                  <button className="icon-button danger" onClick={() => void remove(item.id)} title="Delete" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {visibleNews.length === 0 && <EmptyRow columns={4} />}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function BannersPanel({
  token,
  banners,
  onChanged,
  onError,
}: {
  token: string;
  banners: Banner[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkType: '',
    linkValue: '',
    position: 0,
    status: 'active' as Banner['status'],
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const visibleBanners = useMemo(
    () =>
      banners.filter((banner) =>
        includesSearch(searchableText(banner.title, banner.image_url, banner.status, banner.link_type, banner.link_value), search),
      ),
    [banners, search],
  );

  async function uploadImage(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onError('Use a JPEG, PNG, or WebP image');
      return;
    }

    setUploading(true);
    try {
      const upload = await api.uploadAsset(token, 'banners', file);
      setForm((current) => ({ ...current, imageUrl: upload.publicUrl }));
      onChanged('Uploaded banner image');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createBanner(token, {
        ...form,
        linkType: form.linkType || null,
        linkValue: form.linkValue || null,
      });
      setForm({ title: '', imageUrl: '', linkType: '', linkValue: '', position: 0, status: 'active' });
      onChanged('Created banner');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to create banner');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.deleteBanner(token, id);
      onChanged('Deleted banner');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to delete banner');
    }
  }

  async function setStatus(id: string, status: Banner['status']) {
    try {
      await api.updateBanner(token, id, { status });
      onChanged(`Banner marked ${status}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to update banner');
    }
  }

  return (
    <div className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <h2>
          <Image size={18} />
          New banner
        </h2>
        <label>
          Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </label>
        <label>
          Image URL
          <input
            type="url"
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            required
          />
        </label>
        <label>
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
              event.target.value = '';
            }}
          />
        </label>
        <div className="split-row">
          <label>
            Link type
            <input value={form.linkType} onChange={(event) => setForm({ ...form, linkType: event.target.value })} />
          </label>
          <label>
            Position
            <input
              type="number"
              min={0}
              value={form.position}
              onChange={(event) => setForm({ ...form, position: Number(event.target.value) })}
            />
          </label>
        </div>
        <label>
          Link value
          <input value={form.linkValue} onChange={(event) => setForm({ ...form, linkValue: event.target.value })} />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as Banner['status'] })}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <button className="primary-button" disabled={busy}>
          <Plus size={16} />
          Create banner
        </button>
      </form>

      <section className="table-panel">
        <div className="panel-heading">
          <h2>Banners</h2>
          <span>{visibleBanners.length} records</span>
        </div>
        <div className="table-tools">
          <input placeholder="Search banners" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Position</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleBanners.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <small>{item.image_url}</small>
                </td>
                <td>
                  <span className={`pill ${item.status}`}>{item.status}</span>
                </td>
                <td>{item.position}</td>
                <td className="actions wide-actions">
                  <button className="secondary-button" onClick={() => void setStatus(item.id, 'active')}>
                    Active
                  </button>
                  <button className="secondary-button" onClick={() => void setStatus(item.id, 'inactive')}>
                    Inactive
                  </button>
                  <button className="icon-button danger" onClick={() => void remove(item.id)} title="Delete" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {visibleBanners.length === 0 && <EmptyRow columns={4} />}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function LogsPanel({ logs }: { logs: ActivityLog[] }) {
  return (
    <section className="table-panel">
      <div className="panel-heading">
        <h2>Activity Logs</h2>
        <span>{logs.length} records</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Description</th>
            <th>User</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>
                <span className="pill">{log.module}:{log.action}</span>
              </td>
              <td>
                <strong>{log.description}</strong>
                <small>{log.organizations?.name ?? log.ip_address ?? log.id}</small>
              </td>
              <td>{log.users?.full_name ?? log.users?.email ?? '-'}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {logs.length === 0 && <EmptyRow columns={4} />}
        </tbody>
      </table>
    </section>
  );
}

function ReviewsPanel({
  token,
  reviews,
  onChanged,
  onError,
}: {
  token: string;
  reviews: ReviewItem[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const visibleReviews = useMemo(
    () =>
      reviews.filter((review) =>
        includesSearch(
          searchableText(review.users?.full_name, review.users?.email, review.rating, review.comment, review.status),
          search,
        ),
      ),
    [reviews, search],
  );

  async function setStatus(id: string, status: ReviewItem['status']) {
    try {
      await api.updateReviewStatus(token, id, status);
      onChanged(`Review marked ${status}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to update review');
    }
  }

  return (
    <section className="table-panel">
      <div className="panel-heading">
        <h2>Review Moderation</h2>
        <span>{visibleReviews.length} records</span>
      </div>
      <div className="table-tools">
        <input placeholder="Search reviews" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <table>
        <thead>
          <tr>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleReviews.map((review) => (
            <tr key={review.id}>
              <td>
                <strong>{review.users?.full_name ?? review.users?.email ?? 'Mobile user'}</strong>
                <small>{new Date(review.created_at).toLocaleString()}</small>
              </td>
              <td>{review.rating}/5</td>
              <td>
                <small>{review.comment ?? '-'}</small>
              </td>
              <td>
                <span className={`pill ${review.status}`}>{review.status}</span>
              </td>
              <td className="actions wide-actions">
                <button className="secondary-button" onClick={() => void setStatus(review.id, 'published')}>
                  Publish
                </button>
                <button className="secondary-button" onClick={() => void setStatus(review.id, 'hidden')}>
                  Hide
                </button>
              </td>
            </tr>
          ))}
          {visibleReviews.length === 0 && <EmptyRow columns={5} />}
        </tbody>
      </table>
    </section>
  );
}

function BookingsPanel({
  token,
  bookings,
  onChanged,
  onError,
}: {
  token: string;
  bookings: BookingItem[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const visibleBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        includesSearch(
          searchableText(
            booking.users?.full_name,
            booking.users?.email,
            booking.users?.phone,
            booking.services?.name,
            booking.note,
            booking.status,
          ),
          search,
        ),
      ),
    [bookings, search],
  );

  async function setStatus(id: string, status: BookingItem['status']) {
    try {
      await api.updateBookingStatus(token, id, status);
      onChanged(`Booking marked ${status}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to update booking');
    }
  }

  return (
    <section className="table-panel">
      <div className="panel-heading">
        <h2>Booking Management</h2>
        <span>{visibleBookings.length} records</span>
      </div>
      <div className="table-tools">
        <input placeholder="Search bookings" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Schedule</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleBookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <strong>{booking.users?.full_name ?? booking.users?.email ?? 'Mobile user'}</strong>
                <small>{booking.note ?? booking.users?.phone ?? booking.id}</small>
              </td>
              <td>
                <strong>{booking.services?.name ?? '-'}</strong>
                <small>{booking.services?.price ?? '-'}</small>
              </td>
              <td>{new Date(booking.scheduled_at).toLocaleString()}</td>
              <td>
                <span className={`pill ${booking.status}`}>{booking.status}</span>
              </td>
              <td className="actions wide-actions">
                <button className="secondary-button" onClick={() => void setStatus(booking.id, 'confirmed')}>
                  Confirm
                </button>
                <button className="secondary-button" onClick={() => void setStatus(booking.id, 'completed')}>
                  Complete
                </button>
                <button className="secondary-button" onClick={() => void setStatus(booking.id, 'cancelled')}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
          {visibleBookings.length === 0 && <EmptyRow columns={5} />}
        </tbody>
      </table>
    </section>
  );
}

function LoginScreen({
  apiReady,
  error,
  onLogin,
}: {
  apiReady: 'checking' | 'ok' | 'error';
  error: string | null;
  onLogin: (token: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setLocalError(null);
    try {
      const result = await api.login(email, password);
      onLogin(result.accessToken);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-mark">
          <ShieldCheck size={28} />
        </div>
        <h1>Pet Platform Admin</h1>
        <p>Sign in with the Super Admin account from Supabase.</p>

        <label>
          Email
          <input
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {(localError || error) && <div className="form-error">{localError ?? error}</div>}

        <button className="primary-button" disabled={busy}>
          <ShieldCheck size={17} />
          {busy ? 'Signing in' : 'Sign in'}
        </button>

        <div className={`status-line ${apiReady}`}>
          <Database size={15} />
          API database: {apiReady}
        </div>

        <a className="users-link" href="#/users">
          <Users size={15} />
          View test users
        </a>
      </form>
    </div>
  );
}

function UsersPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const sections = [...new Set(testAccounts.map((account) => account.section))];

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  }

  const allAccountsText = testAccounts.map(formatAccount).join('\n\n');

  return (
    <main className="users-page">
      <header className="users-hero">
        <div className="users-mark">
          <KeyRound size={26} />
        </div>
        <div>
          <h1>Test Users</h1>
          <p>Development accounts for Pet Platform Admin.</p>
        </div>
        <button className="secondary-button" onClick={() => void copyText('all users', allAccountsText)}>
          <Copy size={16} />
          Copy all
        </button>
      </header>

      {copied && <Notice tone="success" text={`Copied ${copied}`} onClose={() => setCopied(null)} />}

      <div className="user-sections">
        {sections.map((section) => (
          <section className="users-section" key={section}>
            <div className="panel-heading">
              <h2>{section}</h2>
              <span>{testAccounts.filter((account) => account.section === section).length} accounts</span>
            </div>
            <div className="account-grid">
              {testAccounts
                .filter((account) => account.section === section)
                .map((account) => (
                  <article className="account-card" key={account.email}>
                    <div>
                      <span className="pill">{account.role}</span>
                      <h3>{account.label}</h3>
                      <p>{account.scope}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Email</dt>
                        <dd>{account.email}</dd>
                      </div>
                      <div>
                        <dt>Password</dt>
                        <dd>{account.password}</dd>
                      </div>
                    </dl>
                    <div className="account-actions">
                      <button className="secondary-button" onClick={() => void copyText(account.label, formatAccount(account))}>
                        <Copy size={16} />
                        Copy user
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => void copyText(`${account.label} email`, account.email)}
                      >
                        <Copy size={16} />
                        Email
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => void copyText(`${account.label} password`, account.password)}
                      >
                        <Copy size={16} />
                        Password
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="users-footer">
        <a href="#">Back to login</a>
      </footer>
    </main>
  );
}

function formatAccount(account: (typeof testAccounts)[number]) {
  return `${account.label}\nURL: ${account.url}\nEmail: ${account.email}\nPassword: ${account.password}\nRole: ${account.role}\nScope: ${account.scope}`;
}

function DashboardPanel({
  dashboard,
  activeOrgs,
  apiReady,
  loading,
}: {
  dashboard?: DashboardStats;
  activeOrgs: number;
  apiReady: 'checking' | 'ok' | 'error';
  loading: boolean;
}) {
  return (
    <section className="dashboard-grid">
      <MetricCard icon={<Building2 size={20} />} label="Organizations" value={dashboard?.organizations ?? 0} />
      <MetricCard icon={<CheckCircle2 size={20} />} label="Active" value={activeOrgs} />
      <MetricCard icon={<Users size={20} />} label="Users" value={dashboard?.users ?? 0} />
      <MetricCard icon={<Activity size={20} />} label="News" value={dashboard?.news ?? 0} />
      <div className="wide-panel">
        <h2>System status</h2>
        <div className="status-list">
          <span>API</span>
          <strong>{loading ? 'loading' : 'ready'}</strong>
          <span>Database</span>
          <strong>{apiReady}</strong>
        </div>
      </div>
    </section>
  );
}

function OrganizationPanel({
  type,
  token,
  items,
  onChanged,
  onError,
}: {
  type: 'shop' | 'clinic';
  token: string;
  items: Organization[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<OrganizationPayload>({
    name: '',
    status: 'active',
  });
  const [busy, setBusy] = useState(false);
  const label = type === 'shop' ? 'shop' : 'clinic';
  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        includesSearch(
          searchableText(
            item.name,
            item.status,
            item.phone,
            item.email,
            item.address,
            item.province,
            item.district,
          ),
          search,
        ),
      ),
    [items, search],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (type === 'shop') await api.createShop(token, cleanOrganizationPayload(form));
      else await api.createClinic(token, cleanOrganizationPayload(form));
      setForm({ name: '', status: 'active' });
      onChanged(`Created ${label}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : `Unable to create ${label}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(`Delete this ${label}?`)) return;
    try {
      if (type === 'shop') await api.deleteShop(token, id);
      else await api.deleteClinic(token, id);
      onChanged(`Deleted ${label}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : `Unable to delete ${label}`);
    }
  }

  async function setStatus(id: string, status: Organization['status']) {
    try {
      if (type === 'shop') await api.updateShop(token, id, { status });
      else await api.updateClinic(token, id, { status });
      onChanged(`Updated ${label} status`);
    } catch (err) {
      onError(err instanceof Error ? err.message : `Unable to update ${label}`);
    }
  }

  return (
    <div className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <h2>
          <Plus size={18} />
          New {label}
        </h2>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Phone
          <input value={form.phone ?? ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label>
          Address
          <textarea value={form.address ?? ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as OrganizationPayload['status'] })}
          >
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="inactive">inactive</option>
            <option value="suspended">suspended</option>
          </select>
        </label>
        <button className="primary-button" disabled={busy}>
          <Plus size={16} />
          Create {label}
        </button>
      </form>

      <section className="table-panel">
        <div className="panel-heading">
          <h2>{type === 'shop' ? 'Shops' : 'Clinics'}</h2>
          <span>{visibleItems.length} records</span>
        </div>
        <div className="table-tools">
          <input placeholder={`Search ${label}s`} value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <OrganizationTable items={visibleItems} onDelete={remove} onStatusChange={setStatus} />
      </section>
    </div>
  );
}

function AdminsPanel({
  token,
  admins,
  organizations,
  onChanged,
  onError,
}: {
  token: string;
  admins: AdminMembership[];
  organizations: Organization[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const firstOrg = organizations[0]?.id ?? '';
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'shop_admin' as 'shop_admin' | 'clinic_admin',
    organizationId: firstOrg,
    organizationRole: 'owner' as 'owner' | 'manager' | 'staff',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!form.organizationId && firstOrg) {
      setForm((current) => ({ ...current, organizationId: firstOrg }));
    }
  }, [firstOrg, form.organizationId]);

  const selectedOrg = useMemo(
    () => organizations.find((org) => org.id === form.organizationId),
    [organizations, form.organizationId],
  );
  const visibleAdmins = useMemo(
    () =>
      admins.filter((admin) =>
        includesSearch(
          searchableText(
            admin.users?.full_name,
            admin.users?.email,
            admin.users?.role,
            admin.organizations?.name,
            admin.organizations?.type,
          ),
          search,
        ),
      ),
    [admins, search],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createAdmin(token, form);
      setForm({
        email: '',
        password: '',
        fullName: '',
        role: selectedOrg?.type === 'clinic' ? 'clinic_admin' : 'shop_admin',
        organizationId: form.organizationId,
        organizationRole: 'owner',
      });
      onChanged('Created organization admin');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to create admin');
    } finally {
      setBusy(false);
    }
  }

  async function remove(userId: string) {
    if (!confirm('Deactivate this admin?')) return;
    try {
      await api.deactivateAdmin(token, userId);
      onChanged('Deactivated admin');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to deactivate admin');
    }
  }

  return (
    <div className="content-grid">
      <form className="form-panel" onSubmit={submit}>
        <h2>
          <UserPlus size={18} />
          New admin
        </h2>
        <label>
          Full name
          <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label>
          Organization
          <select
            value={form.organizationId}
            onChange={(event) => {
              const org = organizations.find((item) => item.id === event.target.value);
              setForm({
                ...form,
                organizationId: event.target.value,
                role: org?.type === 'clinic' ? 'clinic_admin' : 'shop_admin',
              });
            }}
            required
          >
            <option value="" disabled>
              Select organization
            </option>
            {organizations.map((org) => (
              <option value={org.id} key={org.id}>
                {org.name} ({org.type})
              </option>
            ))}
          </select>
        </label>
        <div className="split-row">
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as typeof form.role })}
            >
              <option value="shop_admin">shop_admin</option>
              <option value="clinic_admin">clinic_admin</option>
            </select>
          </label>
          <label>
            Org role
            <select
              value={form.organizationRole}
              onChange={(event) =>
                setForm({ ...form, organizationRole: event.target.value as typeof form.organizationRole })
              }
            >
              <option value="owner">owner</option>
              <option value="manager">manager</option>
              <option value="staff">staff</option>
            </select>
          </label>
        </div>
        <button className="primary-button" disabled={busy || organizations.length === 0}>
          <UserPlus size={16} />
          Create admin
        </button>
      </form>

      <section className="table-panel">
        <div className="panel-heading">
          <h2>Organization admins</h2>
          <span>{visibleAdmins.length} records</span>
        </div>
        <div className="table-tools">
          <input placeholder="Search admins" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleAdmins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.users?.full_name ?? '-'}</td>
                <td>{admin.users?.email ?? '-'}</td>
                <td>{admin.organizations?.name ?? '-'}</td>
                <td>
                  <span className="pill">{admin.users?.role}</span>
                </td>
                <td className="actions">
                  <button
                    className="icon-button danger"
                    onClick={() => admin.users?.id && void remove(admin.users.id)}
                    title="Deactivate admin"
                    aria-label="Deactivate admin"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {visibleAdmins.length === 0 && <EmptyRow columns={5} />}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function OrganizationTable({
  items,
  onDelete,
  onStatusChange,
}: {
  items: Organization[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Organization['status']) => void;
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Phone</th>
          <th>Email</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              <strong>{item.name}</strong>
              <small>{item.address || item.province || item.id}</small>
            </td>
            <td>
              <span className={`pill ${item.status}`}>{item.status}</span>
            </td>
            <td>{item.phone ?? '-'}</td>
            <td>{item.email ?? '-'}</td>
            <td className="actions wide-actions">
              <button className="secondary-button" onClick={() => void onStatusChange(item.id, 'active')}>
                Active
              </button>
              <button className="secondary-button" onClick={() => void onStatusChange(item.id, 'inactive')}>
                Inactive
              </button>
              <button className="icon-button danger" onClick={() => void onDelete(item.id)} title="Delete" aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && <EmptyRow columns={5} />}
      </tbody>
    </table>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NavButton({
  icon,
  active,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={active ? 'active' : ''} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

function Notice({ tone, text, onClose }: { tone: 'success' | 'error'; text: string; onClose: () => void }) {
  return (
    <div className={`notice ${tone}`}>
      <span>{text}</span>
      <button onClick={onClose} aria-label="Dismiss">
        x
      </button>
    </div>
  );
}

function EmptyRow({ columns }: { columns: number }) {
  return (
    <tr>
      <td colSpan={columns} className="empty-row">
        No records yet
      </td>
    </tr>
  );
}

function titleForTab(tab: Tab) {
  if (tab === 'shops') return 'Shop Management';
  if (tab === 'clinics') return 'Clinic Management';
  if (tab === 'admins') return 'Admin Management';
  if (tab === 'news') return 'News Management';
  if (tab === 'banners') return 'Banner Management';
  if (tab === 'logs') return 'Activity Logs';
  if (tab === 'org-dashboard') return 'Organization Dashboard';
  if (tab === 'profile') return 'Organization Profile';
  if (tab === 'services') return 'Services';
  if (tab === 'own-news') return 'Organization News';
  if (tab === 'reviews') return 'Review Moderation';
  if (tab === 'bookings') return 'Booking Management';
  return 'Dashboard';
}

function subtitleForTab(tab: Tab) {
  if (tab === 'shops') return 'Create and review shop organizations.';
  if (tab === 'clinics') return 'Create and review clinic organizations.';
  if (tab === 'admins') return 'Create organization admins and assign ownership.';
  if (tab === 'news') return 'Publish global news and announcements.';
  if (tab === 'banners') return 'Control mobile home banners.';
  if (tab === 'logs') return 'Review recent admin activity.';
  if (tab === 'org-dashboard') return 'Overview for your assigned shop or clinic.';
  if (tab === 'profile') return 'Update the public information for your organization.';
  if (tab === 'services') return 'Manage services shown to mobile users.';
  if (tab === 'own-news') return 'Publish news and promotions for your organization.';
  if (tab === 'reviews') return 'Publish or hide customer reviews.';
  if (tab === 'bookings') return 'Confirm, complete, or cancel customer bookings.';
  return 'System overview and operational status.';
}

function cleanOrganizationPayload(input: OrganizationPayload): OrganizationPayload {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === '' ? null : value]),
  ) as OrganizationPayload;
}

export default App;
