import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiClipboard,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiSettings,
  FiUploadCloud,
  FiUser,
} from 'react-icons/fi';

type DashboardSection = {
  title: string;
  description: string;
  status: string;
  route: string;
  icon: ReactNode;
};

const candidate = {
  name: 'John Doe',
  id: 'WHS-2026-1048',
  profileStatus: 'Active',
  profileStrength: 85,
  applicationProgress: '5/5',
};

const sections: DashboardSection[] = [
  {
    title: 'Basic Information',
    description: 'Personal details and contact information',
    status: 'Completed',
    route: '/candidate/basic-information',
    icon: <FiUser />,
  },
  {
    title: 'Professional Information',
    description: 'Career preferences and work history',
    status: 'Completed',
    route: '/candidate/professional-information',
    icon: <FiBriefcase />,
  },
  {
    title: 'Skills & Experience',
    description: 'Technical skills and years of experience',
    status: 'Completed',
    route: '/candidate/skills-experience',
    icon: <FiBookOpen />,
  },
  {
    title: 'Additional Details',
    description: 'Availability, salary expectations, and notes',
    status: 'Completed',
    route: '/candidate/additional-details',
    icon: <FiClipboard />,
  },
  {
    title: 'Upload CV',
    description: 'Latest resume and supporting documents',
    status: 'Completed',
    route: '/candidate/upload-cv',
    icon: <FiUploadCloud />,
  },
];

const activities = [
  'Profile strength increased to 85%',
  'CV uploaded successfully',
  'Skills & Experience section updated',
  'Application progress marked complete',
  'Professional Information reviewed',
  'Basic Information verified',
];

const notifications = [
  'Your candidate profile is visible to recruiters.',
  'A new profile improvement tip is available.',
  'Your CV was processed successfully.',
];

function CandidateDashboard() {
  const navigate = useNavigate();
  const activityRef = useRef<HTMLDivElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const visibleActivities = useMemo(
    () => (showAllActivity ? activities : activities.slice(0, 4)),
    [showAllActivity],
  );

  const goTo = (path: string) => {
    navigate(path);
  };

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
    window.setTimeout(() => activityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <main className="candidate-dashboard-page">
      <nav className="candidate-dashboard-navbar" aria-label="Candidate dashboard navigation">
        <button className="candidate-dashboard-logo" type="button" onClick={() => goTo('/candidate/dashboard')}>
          Join Our Candidate Pool
        </button>

        <div className="candidate-dashboard-nav-actions">
          <button
            className="candidate-dashboard-icon-button"
            type="button"
            aria-label="Open notifications"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <FiBell />
            <span className="candidate-dashboard-badge">{notifications.length}</span>
          </button>

          <div className="candidate-dashboard-avatar-wrap">
            <button
              className="candidate-dashboard-avatar-button"
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-expanded={dropdownOpen}
            >
              <span className="candidate-dashboard-avatar">JD</span>
              <span>{candidate.name}</span>
              <FiChevronDown />
            </button>

            {dropdownOpen && (
              <div className="candidate-dashboard-menu">
                <button type="button" onClick={() => goTo('/candidate/profile')}>
                  <FiUser />
                  Profile
                </button>
                <button type="button" onClick={() => goTo('/settings')}>
                  <FiSettings />
                  Settings
                </button>
                <button type="button" onClick={() => goTo('/signin')}>
                  <FiLogOut />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {notificationsOpen && (
        <section className="candidate-dashboard-notification-panel" aria-label="Notifications">
          <div>
            <h2>Notifications</h2>
            <button type="button" onClick={() => setNotificationsOpen(false)}>
              Close
            </button>
          </div>
          <ul>
            {notifications.map((notification) => (
              <li key={notification}>{notification}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="candidate-dashboard-hero">
        <div className="candidate-dashboard-heading">
          <h1>
            Welcome back, John Doe <span aria-hidden="true">{'\u{1F44B}'}</span>
          </h1>
          <p>Track your candidate profile, application progress, and the next best actions from one place.</p>
        </div>
        <button className="candidate-dashboard-button" type="button" onClick={() => goTo('/candidate/edit-profile')}>
          <FiUser />
          Edit Profile
        </button>
      </section>

      <section className="candidate-dashboard-grid candidate-dashboard-summary-grid" aria-label="Candidate summary">
        <article className="candidate-dashboard-card candidate-dashboard-stat">
          <span>Candidate ID</span>
          <strong>{candidate.id}</strong>
        </article>
        <article className="candidate-dashboard-card candidate-dashboard-stat">
          <span>Profile Status</span>
          <strong>{candidate.profileStatus}</strong>
        </article>
        <article className="candidate-dashboard-card candidate-dashboard-stat">
          <span>Profile Strength</span>
          <strong>{candidate.profileStrength}%</strong>
          <div className="candidate-dashboard-progress">
            <span style={{ width: `${candidate.profileStrength}%` }} />
          </div>
        </article>
        <article className="candidate-dashboard-card candidate-dashboard-stat">
          <span>Application Progress</span>
          <strong>{candidate.applicationProgress}</strong>
        </article>
      </section>

      <section className="candidate-dashboard-main-grid">
        <div className="candidate-dashboard-left-column">
          <section className="candidate-dashboard-card">
            <div className="candidate-dashboard-section-header">
              <h2>Application Sections</h2>
              <button type="button" onClick={() => goTo('/candidate/edit-profile')}>
                Update Profile
              </button>
            </div>

            <div className="candidate-dashboard-section-list">
              {sections.map((section) => (
                <button
                  className="candidate-dashboard-section-card"
                  type="button"
                  key={section.title}
                  onClick={() => goTo(section.route)}
                >
                  <span className="candidate-dashboard-icon">{section.icon}</span>
                  <span>
                    <strong>{section.title}</strong>
                    <small>{section.description}</small>
                  </span>
                  <em>{section.status}</em>
                </button>
              ))}
            </div>
          </section>

          <section className="candidate-dashboard-card" ref={activityRef}>
            <div className="candidate-dashboard-section-header">
              <h2>Recent Activity</h2>
              <button type="button" onClick={handleViewAllActivity}>
                View all activity
              </button>
            </div>
            <ul className="candidate-dashboard-activity-list">
              {visibleActivities.map((activity) => (
                <li key={activity}>
                  <FiCheckCircle />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="candidate-dashboard-right-column">
          <section className="candidate-dashboard-quick-actions">
            <button type="button" className="candidate-dashboard-card candidate-dashboard-action-card" onClick={() => goTo('/candidate/application-progress')}>
              <FiClipboard />
              <span>View Application Progress</span>
            </button>
            <button type="button" className="candidate-dashboard-card candidate-dashboard-action-card" onClick={() => goTo('/candidate/help-center')}>
              <FiHelpCircle />
              <span>Need Help?</span>
            </button>
            <button type="button" className="candidate-dashboard-card candidate-dashboard-action-card" onClick={() => setNotificationsOpen(true)}>
              <FiBell />
              <span>Notifications</span>
            </button>
          </section>

          <section className="candidate-dashboard-card candidate-dashboard-tips-card">
            <FiFileText />
            <h2>Tips to Improve Your Profile</h2>
            <p>Add measurable achievements and keep your CV updated so recruiters can quickly understand your fit.</p>
            <button type="button" onClick={() => goTo('/candidate/edit-profile')}>
              Update Profile
            </button>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default CandidateDashboard;
