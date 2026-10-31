function Sidebar({ activeMenu, setActiveMenu }) {
  const menuItems = [
    { id: 'Overview', label: 'Overview & Challenges', icon: '' },
    { id: 'Questions', label: 'Upload Question', icon: '' },
    { id: 'Categories', label: 'Manage Categories', icon: '' },
    { id: 'Users', label: 'Manage Users', icon: '' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Director Deck</h2>
        <p>Challenge & Category Controls</p>
      </div>
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`admin-sidebar-btn ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
