// src/components/Layout/Sidebar.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, User, Settings, ChevronLeft, ChevronRight, 
  BarChart3, FileText, Users, Mail, Bell, HelpCircle,
  LucideIcon
} from 'lucide-react';

// ==================== Types & Interfaces ====================
export interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  path?: string;
  onClick?: () => void;
  badge?: number | string;
  disabled?: boolean;
  children?: NavItem[];
}

export interface SidebarProps {
  /** Navigation items array */
  navItems?: NavItem[];
  /** Collapsed state (controlled) */
  collapsed?: boolean;
  /** Initial collapsed state (uncontrolled) */
  defaultCollapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Width when expanded */
  expandedWidth?: string;
  /** Width when collapsed */
  collapsedWidth?: string;
  /** Custom header content */
  header?: React.ReactNode;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Custom logo/company name */
  logo?: React.ReactNode;
  /** Theme variants */
  variant?: 'default' | 'dark' | 'minimal' | 'compact';
  /** Show tooltips when collapsed */
  showTooltips?: boolean;
  /** Responsive breakpoint for auto-collapsing */
  responsiveBreakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'never';
  /** Custom CSS classes */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

interface SidebarContextType {
  collapsed: boolean;
  expandedWidth: string;
  collapsedWidth: string;
  variant: string;
  showTooltips: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  expandedWidth: '16rem',
  collapsedWidth: '4rem',
  variant: 'default',
  showTooltips: true,
});

// ==================== Default Navigation Items ====================
const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'expenses', label: 'Expenses', icon: FileText, path: '/expenses' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', badge: 'New' },
  { id: 'predictions', label: 'Predictions', icon: Users, path: '/predictions' },
  { id: 'anomalies', label: 'Anomalies', icon: Bell, path: '/anomalies', badge: 3 },
  { id: 'scan', label: 'Receipt Scanner', icon: Mail, path: '/scan' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

// ==================== Sub-components ====================
const SidebarItem: React.FC<{
  item: NavItem;
  depth?: number;
}> = ({ item, depth = 0 }) => {
  const { collapsed, showTooltips, variant } = useContext(SidebarContext);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const Icon = item.icon;
  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';
  
  // Determine if this item is active based on current URL
  const isActive = location.pathname === item.path;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      // Use React Router to navigate
      navigate(item.path);
    }
  };

  const content = (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${depth > 0 ? 'ml-2 pl-2' : ''}
        ${isActive
          ? variant === 'dark' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
          : variant === 'dark'
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isCompact ? 'py-2' : ''}
        ${isMinimal ? 'justify-center' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      disabled={item.disabled}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      {Icon && (
        <div className="relative">
          <Icon size={isCompact ? 18 : 20} />
          {item.badge && !collapsed && (
            <span className={`
              absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full
              ${variant === 'dark' 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {item.badge}
            </span>
          )}
        </div>
      )}
      
      {(!collapsed || isHovered) && !isMinimal && (
        <div className="flex-1 flex items-center justify-between">
          <span className={`font-medium ${isCompact ? 'text-sm' : ''}`}>
            {item.label}
          </span>
          {item.badge && collapsed && (
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full
              ${variant === 'dark' 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {item.badge}
            </span>
          )}
        </div>
      )}

      {hasChildren && !collapsed && !isMinimal && (
        <ChevronRight size={16} className="ml-auto" />
      )}
    </button>
  );

  if (collapsed && showTooltips && !isMinimal) {
    return (
      <div className="relative group">
        {content}
        <div className={`
          absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2
          bg-gray-900 text-white text-sm rounded-lg shadow-xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap z-50
          before:absolute before:right-full before:top-1/2 
          before:-translate-y-1/2 before:border-8
          before:border-transparent before:border-r-gray-900
        `}>
          {item.label}
          {item.badge && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      </div>
    );
  }

  return content;
};

const SidebarHeader: React.FC<{ logo?: React.ReactNode }> = ({ logo }) => {
  const { collapsed, variant } = useContext(SidebarContext);
  const isDark = variant === 'dark';

  return (
    <div className={`
      flex items-center gap-3 px-4 py-5 border-b
      ${isDark ? 'border-gray-700' : 'border-gray-200'}
      ${collapsed ? 'justify-center' : ''}
    `}>
      {logo || (
        <>
          <div className={`rounded-lg p-2 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
            <Home size={24} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <h1>FinAI : Sentinel</h1>
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Expense Tracker
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== FIXED SIDEBAR FOOTER WITH WORKING LOGOUT ====================
const SidebarFooter: React.FC = () => {
  const { collapsed, variant } = useContext(SidebarContext);
  const navigate = useNavigate(); // ✅ For navigation
  const isDark = variant === 'dark';

  // ✅ Logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
    
    console.log('Logged out successfully');
  };

  return (
    <div className={`
      px-4 py-4 border-t
      ${isDark ? 'border-gray-700' : 'border-gray-200'}
    `}>
      {!collapsed ? (
        <div className="space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <div className="flex-1">
              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                John Doe
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Admin
              </p>
            </div>
          </div>
          
          {/* ✅ WORKING LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isDark 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400' 
                : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
              }
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
            `}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* User avatar only */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
          
          {/* ✅ WORKING LOGOUT BUTTON FOR COLLAPSED STATE */}
          <div className="relative group flex justify-center">
            <button
              onClick={handleLogout}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isDark 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400' 
                  : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                }
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              `}
              title="Logout"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
            
            {/* Tooltip for collapsed state */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-r-gray-900">
              Logout
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Main Sidebar Component ====================
const Sidebar: React.FC<SidebarProps> = ({
  navItems = defaultNavItems,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  expandedWidth = '16rem',
  collapsedWidth = '4rem',
  header,
  footer,
  logo,
  variant = 'default',
  showTooltips = true,
  responsiveBreakpoint = 'lg',
  className = '',
  style,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const navigate = useNavigate();
  const location = useLocation();

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  // Handle responsive behavior
  useEffect(() => {
    if (responsiveBreakpoint === 'never') return;

    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width < breakpoints[responsiveBreakpoint]) {
        if (!collapsed) {
          handleCollapseChange(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [responsiveBreakpoint, collapsed]);

  const handleCollapseChange = (newCollapsed: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapseChange?.(newCollapsed);
  };

  const toggleCollapse = () => {
    handleCollapseChange(!collapsed);
  };

  // Update active items based on current URL
  const processedNavItems = navItems.map(item => ({
    ...item,
    children: item.children?.map(child => ({
      ...child,
    })),
  }));

  // Determine variant styles
  const variantStyles = {
    default: 'bg-white text-gray-900 border-r border-gray-200',
    dark: 'bg-gray-900 text-white border-r border-gray-800',
    minimal: 'bg-white text-gray-900',
    compact: 'bg-white text-gray-900 border-r border-gray-200',
  };

  // Get actual widths
  const actualExpandedWidth = expandedWidth || '16rem';
  const actualCollapsedWidth = collapsedWidth || '4rem';

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        expandedWidth: actualExpandedWidth,
        collapsedWidth: actualCollapsedWidth,
        variant,
        showTooltips,
      }}
    >
      <aside
        className={`
          flex flex-col h-full transition-all duration-300 ease-in-out
          ${variantStyles[variant]}
          ${className}
        `}
        style={{
          width: collapsed ? actualCollapsedWidth : actualExpandedWidth,
          ...style,
        }}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Header */}
        <div>
          {header || <SidebarHeader logo={logo} />}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className={`
            absolute -right-3 top-6 w-6 h-6 rounded-full
            flex items-center justify-center shadow-md
            ${variant === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }
            border border-gray-300
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
            z-10
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {processedNavItems.map((item) => (
              <li key={item.id}>
                <SidebarItem item={item} />
                {item.children && !collapsed && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <SidebarItem item={child} depth={1} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer - with working logout */}
        <div className="mt-auto">
          {footer === null ? null : footer || <SidebarFooter />}
        </div>

        {/* Responsive Overlay */}
        {windowWidth < 1024 && !collapsed && responsiveBreakpoint !== 'never' && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => handleCollapseChange(true)}
            aria-hidden="true"
          />
        )}
      </aside>
    </SidebarContext.Provider>
  );
};

export default Sidebar;