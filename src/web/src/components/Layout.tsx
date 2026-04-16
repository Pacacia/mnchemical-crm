import { NavLink, Outlet } from 'react-router-dom';

const navSections = [
  {
    title: 'Sales',
    items: [
      { to: '/', label: 'Dashboard' },
      { to: '/customers', label: 'Customers' },
      { to: '/orders', label: 'Orders' },
    ],
  },
  {
    title: 'Logistics',
    items: [
      { to: '/shipments', label: 'Shipments' },
      { to: '/transport', label: 'Transport Costs' },
    ],
  },
  {
    title: 'HR',
    items: [
      { to: '/employees', label: 'Employees' },
      { to: '/attendance', label: 'Today' },
      { to: '/attendance/log', label: 'Attendance Log' },
      { to: '/attendance/report', label: 'Monthly Report' },
      { to: '/leave', label: 'Leave Requests' },
    ],
  },
];

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 220,
        background: '#1a1a2e',
        color: '#fff',
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>MN Chemical</h2>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>CRM System</span>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column' }}>
          {navSections.map(section => (
            <div key={section.title}>
              <div style={{ padding: '0.75rem 1.25rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section.title}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '0.5rem 1.25rem',
                    color: isActive ? '#fff' : '#aaa',
                    background: isActive ? '#16213e' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    borderLeft: isActive ? '3px solid #4361ee' : '3px solid transparent',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <main style={{ flex: 1, background: '#f5f6fa', padding: '1.5rem 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
