import React, { useState, useEffect } from 'react';
import api from '../../api';

const ActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/auth/activity-logs');
      setActivityLogs(response.data.activityLogs || []);
    } catch (error) {
      setError('Failed to fetch activity logs');
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      case 'profile_update':
        return '✏️';
      case 'password_change':
        return '🔑';
      case 'address_add':
        return '📍';
      case 'address_update':
        return '📍';
      case 'menu_update':
        return '🍽️';
      case 'account_deactivated':
        return '⏸️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
        return '#22c55e';
      case 'logout':
        return '#6b7280';
      case 'profile_update':
        return '#3b82f6';
      case 'password_change':
        return '#f59e0b';
      case 'address_add':
      case 'address_update':
        return '#8b5cf6';
      case 'menu_update':
        return '#ec4899';
      case 'account_deactivated':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getActionLabel = (action) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="activity-logs">
        <h2>Activity Logs</h2>
        <div className="loading">Loading activity logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-logs">
        <h2>Activity Logs</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="activity-logs">
      <h2>Activity Logs</h2>
      <p className="description">
        Track your recent account activity including logins, profile updates, and more.
      </p>

      {activityLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Activity Yet</h3>
          <p>Your activity logs will appear here once you start using the app.</p>
        </div>
      ) : (
        <div className="logs-container">
          {activityLogs.map((log, index) => (
            <div key={index} className="log-item">
              <div className="log-icon" style={{ backgroundColor: getActionColor(log.action) + '20' }}>
                <span style={{ color: getActionColor(log.action) }}>
                  {getActionIcon(log.action)}
                </span>
              </div>
              
              <div className="log-content">
                <div className="log-header">
                  <h4 className="log-action">{getActionLabel(log.action)}</h4>
                  <span className="log-time">{formatDate(log.timestamp)}</span>
                </div>
                
                <div className="log-details">
                  <div className="detail-item">
                    <span className="detail-label">Device:</span>
                    <span className="detail-value">{log.device || 'Unknown'}</span>
                  </div>
                  
                  {log.ipAddress && (
                    <div className="detail-item">
                      <span className="detail-label">IP Address:</span>
                      <span className="detail-value">{log.ipAddress}</span>
                    </div>
                  )}
                  
                  {log.location && (
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{log.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .activity-logs {
          padding: 2rem;
        }

        .activity-logs h2 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .description {
          color: #666;
          margin-bottom: 2rem;
        }

        .loading,
        .error {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .error {
          color: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .empty-state p {
          color: #666;
        }

        .logs-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .log-item {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .log-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .log-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 1.5rem;
        }

        .log-content {
          flex: 1;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .log-action {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }

        .log-time {
          color: #666;
          font-size: 0.875rem;
        }

        .log-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-label {
          color: #666;
          font-weight: 500;
          min-width: 80px;
        }

        .detail-value {
          color: #333;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .activity-logs {
            padding: 1rem;
          }

          .log-item {
            padding: 1rem;
          }

          .log-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .detail-item {
            flex-direction: column;
            gap: 0.25rem;
          }

          .detail-label {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityLogs;
